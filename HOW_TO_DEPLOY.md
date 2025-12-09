
# Guia de Deploy e Configuração - Integração Master/Admin/Loja

Este documento explica como configurar as variáveis de ambiente e o fluxo de deploy para que a integração multi-tenant funcione corretamente em produção (Vercel) e desenvolvimento local.

## 1. Variáveis de Ambiente Necessárias

### Projeto MASTER-FARMA (Master)
Recurso: Gerencia os tenants e gera os links para Admin e Loja.

No Vercel (Project Settings > Environment Variables):
```env
# URL base do projeto Admin em produção (SEM barra no final)
VITE_ADMIN_BASE_URL=https://farma-vida-admin.vercel.app

# URL base do projeto Loja em produção (SEM barra no final)
VITE_STORE_BASE_URL=https://farmavida-loja.vercel.app

# Supabase (Padrão)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Projeto FARMA-VIDA (Admin e Loja - Monorepo)
Recurso: Resolve qual tenant carregar baseado na URL ou fallback.

No Vercel (Configurar para ambos os projetos se possível, ou individualmente):

**Para o Admin (farma-vida-admin):**
```env
# Tenant padrão se nenhum for especificado na URL (fallback)
VITE_DEFAULT_TENANT_SLUG_ADMIN=farma-vida

# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**Para a Loja (farma-vida-store):**
```env
# Tenant padrão se nenhum for especificado na URL (fallback)
VITE_DEFAULT_TENANT_SLUG_STORE=farma-vida

# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 2. Como Funciona a Resolução de Tenant

### Fluxo
1. **Master:** Ao criar/listar uma farmácia, o Master gera o link usando `VITE_ADMIN_BASE_URL` + `?tenant=slug` (ou rota direta se configurado).
   - Exemplo link gerado: `https://farma-vida-admin.vercel.app/?tenant=farma-vida` ou `https://farma-vida-admin.vercel.app/farma-vida/dashboard`.

2. **Admin/Loja:**
   - O sistema tenta ler o tenant da URL (parametro `?tenant=...` ou rota `/:slug/...`).
   - Se não encontrar, usa a variável `VITE_DEFAULT_TENANT_SLUG_...`.
   - Se encontrar, carrega os dados do Supabase.
   - Se não encontrar no banco, exibe erro "Farmácia não encontrada".

## 3. Comandos de Deploy

Certifique-se de que os repositórios estão sincronizados.

**Master:**
Push para o branch `main` do repositório `MASTER-FARMA`.

**Admin/Loja:**
Push para o branch `main` do repositório `Farmavida` (Monorepo).
A Vercel deve estar configurada para buildar os subdiretórios corretos (`farma-vida-admin` e `farma-vida-store`).

## 4. Teste Pós-Deploy

1. Acesse o Master: `https://master-farma.vercel.app`
2. Crie uma nova farmácia ou use uma existente.
3. Clique em "Admin" -> Deve abrir o Admin logado/contextualizado na farmácia correta.
4. Clique em "Loja" -> Deve abrir a Loja correta.
