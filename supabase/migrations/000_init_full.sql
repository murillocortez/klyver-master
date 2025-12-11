-- INIT SCHEMA (Based on Application Logic)
-- Run this if your database is empty

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    legal_name TEXT,
    cnpj TEXT,
    phone TEXT,
    email TEXT,
    responsible_name TEXT,
    plan_code TEXT DEFAULT 'free',
    status TEXT DEFAULT 'pending_setup',
    admin_base_url TEXT,
    store_base_url TEXT,
    onboarding_status TEXT DEFAULT 'pending',
    logo_url TEXT,
    address JSONB,
    social_links JSONB,
    whatsapp_number TEXT,
    monthly_revenue NUMERIC DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    risk_score NUMERIC DEFAULT 0,
    api_key TEXT,
    custom_domain_admin TEXT,
    custom_domain_store TEXT,
    domain_status TEXT
);

-- 3. Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'OPERADOR', -- CEO, ADMIN, OPERADOR
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    password_hash TEXT, -- Legacy/Temp
    status TEXT DEFAULT 'active',
    temp_password_created TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT
);

-- 4. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    cost_price NUMERIC,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT,
    barcode TEXT,
    category TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID, -- Link to customers if exists
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    items JSONB -- Denormalized items or use separate table
);

-- 6. Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    cpf TEXT,
    address JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);
