# Documentação de Integração Multi-Tenant (Master, Admin, Loja)

Este documento descreve como funciona a integração de links e resolução de Tenants entre os projetos:
- **Master** (SaaS Dashboard)
- **Admin** (Painel da Farmácia)
- **Loja** (E-commerce da Farmácia)

## Visão Geral
O sistema utiliza o concetto de **Slug** (identificador único da farmácia) para direcioar o usuário à loja ou admin correto.

1. O **Master** gera links para Admin e Loja anexando o parâmetro `?tenant={slug}` à URL base.
2. O **Admin** e a **Loja** leem esse parâmetro (ou o caminho da URL) para identificar qual farmácia carregar.
3. Se o tenant for válido, o sistema carrega os dados do Supabase.

## Configuração de Ambiente (.env)

Para que os links funcionem corretamente em Desenvolvimento (Localhost) e Produção (Vercel), você deve configurar as variáveis de ambiente no projeto **master-farmavida**.

### Arquivo `.env.local` (Local)
No projeto Master:
```bash
VITE_ADMIN_BASE_URL=http://localhost:5174
VITE_STORE_BASE_URL=http://localhost:5173
```
*Ajuste as portas (5173, 5174) conforme onde seus projetos Admin e Loja estão rodando.*

### Variáveis na Vercel (Produção)
No painel da Vercel para o projeto Master:
```bash
VITE_ADMIN_BASE_URL=https://farma-vida-admin.vercel.app
VITE_STORE_BASE_URL=https://farmavida-loja.vercel.app
```

## Funcionamento dos Links

Os links são gerados dinamicamente no Master:
- **Admin:** `${VITE_ADMIN_BASE_URL}?tenant={slug}`
  - Ex: `http://localhost:5174?tenant=farmacia-vida`
- **Loja:** `${VITE_STORE_BASE_URL}?tenant={slug}`
  - Ex: `http://localhost:5173?tenant=farmacia-vida`

Ao acessar esses links:
1. O projeto de destino (Admin ou Loja) recebe a requisição na raiz `/`.
2. Um componente `RootRedirect` detecta o parâmetro `?tenant=...`.
3. O sistema redireciona internamente para a rota correta: `/{slug}/dashboard` (Admin) ou `/{slug}` (Loja).

## Solução de Problemas

### Erro: "Farmácia não encontrada"
- Verifique se o `slug` na URL está correto.
- Verifique se a farmácia existe no banco de dados com esse exato slug.
- Verifique se o status da farmácia é 'active'.

### Erro: "Cannot coerce the result to a single JSON object"
- Este erro ocorria quando o sistema tentava buscar uma farmácia que não existia usando `.single()`.
- **Correção aplicada:** O código agora usa `.maybeSingle()` e trata o caso de 0 resultados exibindo uma mensagem amigável em vez de travar a aplicação.

### Links apontando para localhost em Produção?
- Verifique se você definiu as variáveis de ambiente na Vercel (Configurações do Projeto > Environment Variables).
- Re-faça o deploy do Master após alterar as variáveis.
