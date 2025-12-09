# Klyver Master - Gestão Multi-Tenant

## Instalação

```bash
npm install
```

## Variáveis de Ambiente (.env)

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_BASE_URL=https://klyver-admin.vercel.app
VITE_STORE_BASE_URL=https://klyver-store.vercel.app
```

## Rodar Localmente

```bash
npm run dev
# Acesso: http://localhost:5175
```

## Deploy (Vercel)

1. Importe este repositório/pasta na Vercel.
2. Configure as variáveis de ambiente.
3. Configure Output Directory: `dist`.
