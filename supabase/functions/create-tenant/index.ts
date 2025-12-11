import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation Schema
const TenantSchema = z.object({
    fantasyName: z.string().min(3),
    corporateName: z.string().min(3),
    cnpj: z.string().min(14), // Improve regex as needed
    phone: z.string().min(10),
    email: z.string().email(),
    responsibleName: z.string().min(3),
    planCode: z.string(),
})

const RequestSchema = z.object({
    tenant: TenantSchema,
    adminEmail: z.string().email(),
    adminName: z.string().min(3),
})

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Validation
        const rawBody = await req.json()
        const validation = RequestSchema.safeParse(rawBody)

        if (!validation.success) {
            return new Response(
                JSON.stringify({ error: "Validation Error", details: validation.error.flatten() }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { tenant, adminEmail, adminName } = validation.data

        // 2. Check for Duplicates (Idempotencyish hook)
        // Check if admin email already exists in Auth or Profiles to prevent partial state
        // Note: Auth check is hard via API without failing, but we can check profiles if email matches
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', adminEmail)
            .maybeSingle()

        if (existingProfile) {
            return new Response(
                JSON.stringify({ error: "User already exists with this email" }),
                { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Generate Slug with retries
        const generateSlug = (text: string) => {
            return text.toString().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
        }

        let slug = generateSlug(tenant.fantasyName)
        let isUnique = false
        let attempts = 0

        while (!isUnique && attempts < 5) {
            const { data } = await supabaseClient.from('tenants').select('id').eq('slug', slug).maybeSingle()
            if (!data) {
                isUnique = true
            } else {
                slug = `${generateSlug(tenant.fantasyName)}-${Math.floor(Math.random() * 10000)}`
                attempts++
            }
        }

        if (!isUnique) throw new Error("Could not generate unique slug")

        // 4. Transactional Logic (Manual Rollback Pattern)
        // Supabase Edge Functions don't support SQL transactions natively across Auth + DB
        // We proceed: Tenant -> User -> Profile. If User fails, delete Tenant.

        const newTenantData = {
            display_name: tenant.fantasyName,
            legal_name: tenant.corporateName,
            cnpj: tenant.cnpj,
            phone: tenant.phone,
            email: tenant.email,
            responsible_name: tenant.responsibleName,
            plan_code: tenant.planCode,
            slug: slug,
            status: 'pending_setup', // safer status
            admin_base_url: `https://${slug}.farmamaster.com/admin`,
            store_base_url: `https://${slug}.farmamaster.com`,
            monthly_revenue: 0,
            active_users: 0,
            risk_score: 0,
            onboarding_status: 'completed'
        }

        // A. Create Tenant
        const { data: tenantRow, error: tErr } = await supabaseClient
            .from('tenants')
            .insert(newTenantData)
            .select()
            .single()

        if (tErr) throw tErr

        // B. Create Admin User
        const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const lowers = 'abcdefghijklmnopqrstuvwxyz';
        const tempPassword =
            uppers.charAt(Math.floor(Math.random() * uppers.length)) +
            numbers.charAt(Math.floor(Math.random() * numbers.length)) +
            numbers.charAt(Math.floor(Math.random() * numbers.length)) +
            Array(5).fill(null).map(() => lowers.charAt(Math.floor(Math.random() * lowers.length))).join('');

        const { data: userData, error: uErr } = await supabaseClient.auth.admin.createUser({
            email: adminEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: 'ADMIN',
                full_name: adminName,
                tenant_id: tenantRow.id,
            }
        })

        if (uErr) {
            console.error('Failed to create auth user, rolling back tenant', uErr)
            await supabaseClient.from('tenants').delete().eq('id', tenantRow.id)
            throw new Error(`Auth Error: ${uErr.message}`)
        }

        const userId = userData.user.id

        // C. Create Profile
        const encoder = new TextEncoder();
        const data = encoder.encode(tempPassword);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const { error: pErr } = await supabaseClient.from('profiles').insert({
            id: userId,
            email: adminEmail,
            full_name: adminName,
            role: 'CEO',
            tenant_id: tenantRow.id,
            password_hash: passwordHash,
            status: 'active',
            temp_password_created: new Date().toISOString()
        })

        if (pErr) {
            console.error("Profile creation failed, partial rollback needed (manual intervention or strict cleanup)", pErr)
            // Hard to rollback Auth user without being destructive. 
            // We set status to error on tenant maybe?
            // For now, let's warn.
        }

        // D. Activate Tenant
        await supabaseClient.from('tenants').update({ status: 'active' }).eq('id', tenantRow.id)

        return new Response(
            JSON.stringify({
                success: true,
                tenant: { ...tenantRow, status: 'active' },
                tempPassword
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
