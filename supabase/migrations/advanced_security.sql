-- 1. Ensure RLS is enabled on ALL sensitive tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Tenant Isolation Policy (The Golden Rule)
-- Users can only see data belonging to their tenant
-- We rely on the `tenant_id` in `auth.users` metadata OR `profiles` table.
-- Using metadata is faster (no join).

-- Helper function to get current tenant_id from JWT
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Products
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.products;
CREATE POLICY "Tenant Isolation Select" ON public.products
FOR SELECT
USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "Tenant Isolation All" ON public.products;
CREATE POLICY "Tenant Isolation All" ON public.products
FOR ALL
USING (tenant_id = public.get_my_tenant_id())
WITH CHECK (tenant_id = public.get_my_tenant_id());

-- Policy: Orders
DROP POLICY IF EXISTS "Tenant Isolation Orders" ON public.orders;
CREATE POLICY "Tenant Isolation Orders" ON public.orders
FOR ALL
USING (tenant_id = public.get_my_tenant_id());

-- Policy: Customers
DROP POLICY IF EXISTS "Tenant Isolation Customers" ON public.customers;
CREATE POLICY "Tenant Isolation Customers" ON public.customers
FOR ALL
USING (tenant_id = public.get_my_tenant_id());


-- 3. Public Store Access (Anonymous)
-- Should ONLY access via specific views or if slug matches query (but RLS on slug is hard if we don't know the slug in JWT).
-- Strategy: Allow Anon SELECT on Products/Tenants but Enforce 'slug' filter? No, difficult.
-- Better Strategy: `tenants_public` view (already suggested) and `products` valid for that tenant.

-- NOTE: For the store to work, Anon needs to fetch products by tenant_id (or slug).
-- Since Anon has no tenant_id in JWT, we must allow filtering by tenant_id IF the tenant is active.

CREATE POLICY "Public Store Products" ON public.products
FOR SELECT
TO anon
USING (
    exists (
        select 1 from public.tenants 
        where id = products.tenant_id 
        and status = 'active'
    )
);

-- 4. Secure Profile Updates
-- Users can update their own profile, but NOT their role or tenant_id
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- Simple check: ensure sensitive fields didn't change (a bit complex in generic SQL, usually done by separating columns or triggers)
        -- For now, just trust that the backend API (if used) handles it, or use a BEFORE UPDATE trigger to prevent role changes.
        true
    )
);

-- Trigger to prevent role escalation
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'You cannot change your tenant_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_role_change();

-- 5. Fix Tenant Access for Public
-- Allow anon to see tenant public data if active (Already handled by select policy or View)
-- Ensure 'tenants' table RLS blocks everything else.

DROP POLICY IF EXISTS "Anon Select Public Tenants" ON public.tenants;
CREATE POLICY "Anon Select Public Tenants" ON public.tenants
FOR SELECT
TO anon
USING (status = 'active'); 
-- But this exposes all columns! 
-- Combining with column security (previous step) or strict View usage is key.
-- Recommendation: REVOKE SELECT on sensitive cols from anon in production.

REVOKE SELECT (monthly_revenue, risk_score) ON public.tenants FROM anon;
