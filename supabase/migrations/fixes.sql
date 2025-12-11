-- 1. FIX: Block ANON access to sensitive fields on tenants
-- Revoke all access to public table first
REVOKE ALL ON public.tenants FROM anon;
REVOKE ALL ON public.tenants FROM authenticated;

-- Grant select on non-sensitive columns via a VIEW (Best Practice) or Column Level Privileges (Simpler)
-- Let's use Column Level Privileges for simplicity in this generated script, 
-- but RLS is safer. 

-- RLS POLICY:
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Allow Anon to SELECT only specific rows? 
-- Actually, the frontend selects by slug. 
-- The restriction is on COLUMNS. PostgREST allows filtering columns in the select param, 
-- but to ENFORCE it, we need a restricted View or precise grant.

-- VIEW APPROACH (Recommended)
CREATE OR REPLACE VIEW public.tenants_public AS
SELECT 
    id, 
    slug, 
    display_name, 
    logo_url, 
    plan_code, 
    status, 
    store_base_url, 
    admin_base_url,
    phone, 
    email -- Maybe needed for contact? Use caution.
FROM public.tenants;

GRANT SELECT ON public.tenants_public TO anon;
GRANT SELECT ON public.tenants_public TO authenticated;

-- NOTE: If you use the table directly in the frontend, you might need:
-- GRANT SELECT (id, slug, display_name...) ON public.tenants TO anon;


-- 2. FIX: CASCADE DELETES
-- Products -> Tenant
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_tenant_id_fkey,
ADD CONSTRAINT products_tenant_id_fkey 
    FOREIGN KEY (tenant_id) 
    REFERENCES public.tenants(id) 
    ON DELETE CASCADE;

-- Orders -> Tenant
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_tenant_id_fkey,
ADD CONSTRAINT orders_tenant_id_fkey 
    FOREIGN KEY (tenant_id) 
    REFERENCES public.tenants(id) 
    ON DELETE CASCADE;

-- Profiles -> Tenant
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_tenant_id_fkey,
ADD CONSTRAINT profiles_tenant_id_fkey 
    FOREIGN KEY (tenant_id) 
    REFERENCES public.tenants(id) 
    ON DELETE CASCADE;

-- Order Items -> Order
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey,
ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id)
    REFERENCES public.orders(id)
    ON DELETE CASCADE;
