
import { supabase } from './supabase';
import { Tenant, TenantStatus } from '../types';
import { Database } from '../types/supabase';
import { getAdminUrl, getStoreUrl } from '../utils/urlHelpers';

// Helper to slugify text
const generateSlug = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export const tenantService = {
    async getAll(): Promise<Tenant[]> {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tenants:', error);
            throw error;
        }

        return data.map(this.mapToTenant);
    },

    async create(formData: {
        fantasyName: string;
        corporateName: string;
        cnpj: string;
        phone: string;
        email: string;
        responsibleName: string;
        planCode: string;
        // New fields
        adminName?: string;
        adminEmail?: string;
    }): Promise<{ tenant: Tenant, tempPassword?: string }> {

        // Auto-generate slug and confirm uniqueness (simple retry or append random would be better but keeping simple)
        let slug = generateSlug(formData.fantasyName);
        const randomSuffix = Math.floor(Math.random() * 1000);
        // Check if slug exists
        const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).maybeSingle();
        if (existing) {
            slug = `${slug}-${randomSuffix}`;
        }

        // Default values
        const newTenantData: Database['public']['Tables']['tenants']['Insert'] = {
            display_name: formData.fantasyName,
            legal_name: formData.corporateName,
            cnpj: formData.cnpj,
            phone: formData.phone,
            email: formData.email,
            responsible_name: formData.responsibleName,
            plan_code: formData.planCode,
            slug: slug,
            status: 'active',
            // Save initial URLs based on current env, but frontend primarily uses dynamic generation
            admin_base_url: getAdminUrl(slug),
            store_base_url: getStoreUrl(slug),
            monthly_revenue: 0,
            active_users: 0,
            risk_score: 0
        };

        const { data: tenantData, error } = await supabase
            .from('tenants')
            // @ts-ignore
            .insert(newTenantData as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating tenant:', error);
            throw error;
        }

        // --- USER CREATION LOGIC ---
        let tempPassword = undefined;
        if (formData.adminEmail && formData.adminName) {
            try {
                // 1. Generate Temp Password (1 Upper, 2 Numbers, 5 Lower)
                const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const numbers = '0123456789';
                const lowers = 'abcdefghijklmnopqrstuvwxyz';

                tempPassword =
                    uppers.charAt(Math.floor(Math.random() * uppers.length)) +
                    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
                    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
                    Array(5).fill(null).map(() => lowers.charAt(Math.floor(Math.random() * lowers.length))).join('');

                // 2. Hash Password (Simple SHA-256 for storage simulation/db)
                const msgBuffer = new TextEncoder().encode(tempPassword);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                // 3. Create User in 'profiles' or 'users' (assuming public table for MVP or specific Auth logic)
                // Since we don't have direct access to Auth Admin API here without service key, 
                // we will insert into 'profiles' and assume a linkage or treat this as the "record of truth" for the new tenant.
                // In a real production scenario, this would be an Edge Function call.

                // @ts-ignore
                const newUserPromise = supabase.from('profiles').insert({
                    id: crypto.randomUUID(), // Mocking a UUID since we skipped Auth.signUp
                    full_name: formData.adminName,
                    role: 'ADMIN',
                    // @ts-ignore
                    email: formData.adminEmail, // Assuming email column exists or adding it
                    // @ts-ignore
                    tenant_id: tenantData.id,
                    // @ts-ignore
                    password_hash: passwordHash, // Storing hash
                    // @ts-ignore
                    status: 'active',
                    // @ts-ignore
                    temp_password_created: new Date().toISOString()
                });

                // We don't await this strictly to fail the tenant creation, but we log it
                newUserPromise.then(({ error: userError }) => {
                    if (userError) console.warn('Warning: Could not create initial user profile DB record', userError);
                    else console.log('Initial user profile created successfully');
                });

            } catch (err) {
                console.error("Failed to generate/save initial user", err);
            }
        }

        return { tenant: this.mapToTenant(tenantData), tempPassword };
    },

    async update(id: string, updates: Partial<Tenant> & { adminName?: string; adminEmail?: string; planCode?: string }): Promise<{ tempPassword?: string }> {
        const dbUpdates: any = {};
        if (updates.planCode) dbUpdates.plan_code = updates.planCode;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.fantasyName) dbUpdates.display_name = updates.fantasyName;
        if (updates.corporateName) dbUpdates.legal_name = updates.corporateName;
        if (updates.slug) dbUpdates.slug = updates.slug;
        if (updates.cnpj) dbUpdates.cnpj = updates.cnpj;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.responsibleName) dbUpdates.responsible_name = updates.responsibleName;
        // adminBaseUrl and storeBaseUrl are dynamically generated now, so we don't update them in DB roughly
        // If we strictly wanted to keep DB in sync we could, but dynamic is better for multi-env.


        // Update Tenant Table
        if (Object.keys(dbUpdates).length > 0) {
            const { error } = await supabase
                .from('tenants')
                // @ts-ignore
                .update(dbUpdates as any)
                .eq('id', id);

            if (error) throw error;
        }

        // --- USER UPDATE/CREATE LOGIC (If Admin Fields Provided) ---
        let tempPassword = undefined;
        if (updates.adminEmail && updates.adminName) {
            // Check if profile exists for this tenant
            // In a real app we'd look up by role='ADMIN' and tenant_id
            // For now, let's assume if they provide these, they want to UPSERT the admin user.

            // NOTE: Since we don't store "is_primary_admin" on profile easily, this is a bit heuristic.
            // We will Try to find a user with this email. If exists, update name.
            // If NOT exists, create new user.

            // However, the requirement "Initial User Account" suggests usually creating if not exists.

            // Let's implement a simple logic:
            // 1. Try to find user by email
            const { data: existingUser } = await supabase.from('profiles')
                .select('id')
                .eq('email', updates.adminEmail)
                .maybeSingle();

            if (existingUser) {
                // Update Name only
                // @ts-ignore
                await supabase.from('profiles').update({ full_name: updates.adminName }).eq('id', existingUser.id);
            } else {
                // Create New User (Similar to Create Tenant logic)
                try {
                    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    const numbers = '0123456789';
                    const lowers = 'abcdefghijklmnopqrstuvwxyz';
                    tempPassword =
                        uppers.charAt(Math.floor(Math.random() * uppers.length)) +
                        numbers.charAt(Math.floor(Math.random() * numbers.length)) +
                        numbers.charAt(Math.floor(Math.random() * numbers.length)) +
                        Array(5).fill(null).map(() => lowers.charAt(Math.floor(Math.random() * lowers.length))).join('');

                    const msgBuffer = new TextEncoder().encode(tempPassword);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                    // @ts-ignore
                    await supabase.from('profiles').insert({
                        id: crypto.randomUUID(),
                        full_name: updates.adminName,
                        role: 'ADMIN',
                        // @ts-ignore
                        email: updates.adminEmail,
                        // @ts-ignore
                        tenant_id: id,
                        // @ts-ignore
                        password_hash: passwordHash,
                        // @ts-ignore
                        status: 'active',
                        // @ts-ignore
                        temp_password_created: new Date().toISOString()
                    });
                } catch (e) {
                    console.error('Error creating admin user on update:', e);
                }
            }
        }

        return { tempPassword };
    },

    async delete(id: string): Promise<void> {
        console.log(`Starting deep cleanup for tenant ${id}...`);

        // --- 0. PRE-FETCH IDS ---
        const { data: products } = await supabase.from('products').select('id').eq('tenant_id', id);
        // @ts-ignore
        const productIds = products?.map(p => p.id) || [];

        const { data: orders } = await supabase.from('orders').select('id').eq('tenant_id', id);
        // @ts-ignore
        const orderIds = orders?.map(o => o.id) || [];

        // --- 1. CLEAN UP CHILD RECORDS ---

        // Delete Product Batches
        if (productIds.length > 0) {
            // @ts-ignore
            const { error: batchErr } = await supabase.from('product_batches').delete().in('product_id', productIds);
            if (batchErr) throw new Error(`Falha ao limpar lotes: ${batchErr.message}`);
        }

        // Delete Order Items
        if (orderIds.length > 0) {
            // @ts-ignore
            const { error: itemErr } = await supabase.from('order_items').delete().in('order_id', orderIds);
            if (itemErr) throw new Error(`Falha ao limpar itens de pedido: ${itemErr.message}`);
        }

        // --- 2. LOGS & HISTORY ---
        const tablesToDelete = [
            'invoice_logs', 'crm_logs', 'whatsapp_notifications',
            'price_history', 'restock_recommendations',
            'invoices', 'daily_offers', 'crm_birthday', 'crm_vip',
            'orders', // Orders can be deleted after items are gone
            'products', // Products can be deleted after batches/items/offers are gone
            'customers', 'health_insurance_plans',
            'store_settings', 'fiscal_settings', 'cashback_settings',
            'crm_campaigns', 'store_plans',
            'support_tickets', 'profiles'
        ];

        for (const table of tablesToDelete) {
            // @ts-ignore
            const { error } = await supabase.from(table).delete().eq('tenant_id', id);
            if (error) {
                // Ignore "relation does not exist" if using a list, but these tables should exist.
                // We throw to identify the blocker.
                console.warn(`Failed to clear table ${table}`, error);
                // We don't throw immediately on some tables to allow partial cleanup, 
                // but for core tables like products/orders it matters.
                if (['products', 'orders', 'profiles'].includes(table)) {
                    throw new Error(`Falha ao limpar tabela ${table}: ${error.message}`);
                }
            }
        }

        console.log('Deep cleanup completed.');

        // Finally, delete the tenant
        const { error } = await supabase.from('tenants').delete().eq('id', id);
        if (error) {
            console.error("Final delete failed", error);
            throw error;
        }
    },

    // Mapper function to convert DB structure to UI Tenant interface
    mapToTenant(row: Database['public']['Tables']['tenants']['Row']): Tenant {
        return {
            id: row.id,
            slug: row.slug || '',
            tenant_id: row.id.substring(0, 8).toUpperCase(), // specific format display ID
            fantasyName: row.display_name || 'N/A',
            corporateName: row.legal_name || 'N/A',
            cnpj: row.cnpj || '',
            phone: row.phone || '',
            email: row.email || '',
            responsibleName: row.responsible_name || '',
            logoUrl: row.logo_url || undefined,
            custom_domain_admin: row.custom_domain_admin || undefined,
            custom_domain_store: row.custom_domain_store || undefined,
            domain_status: row.domain_status as any,
            planCode: row.plan_code || 'free',
            status: (row.status as TenantStatus) || 'pending',
            adminBaseUrl: getAdminUrl(row.slug || ''),
            storeBaseUrl: getStoreUrl(row.slug || ''),
            createdAt: row.created_at || new Date().toISOString(),
            nextBillingDate: undefined, // DB doesn't have it yet?
            lastActivity: row.last_activity || undefined,
            monthlyRevenue: row.monthly_revenue || 0,
            activeUsers: row.active_users || 0,
            riskScore: row.risk_score || 0,
            apiKey: row.api_key || undefined,
            // @ts-ignore
            onboardingStatus: row.onboarding_status || 'pending'
        };
    }
};
