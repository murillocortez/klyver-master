# Relatório de Arquitetura e Organização - Sistema Farmavida

Este documento detalha as ações realizadas para organizar, padronizar e corrigir a arquitetura dos três projetos que compõem o ecossistema Farmavida: **Master**, **Admin** e **Loja**.

## 1. O que foi Reorganizado

*   **Estrutura de Diretórios Padronizada**:
    *   Todos os três projetos (`master-farmavida`, `farma-vida-admin`, `farma-vida-store`) agora seguem estritamente a estrutura com pasta `src/`.
    *   Anteriormente, Admin e Loja mantinham arquivos na raiz, enquanto Master tinha duplicidade (raiz e `src/`). Agora, todos os códigos-fonte residem unicamente dentro de `src/`.
*   **Limpeza de Arquivos**:
    *   **Master**: Removida a pasta duplicada `MASTER-FARMA` (clone aninhado incorreto) e arquivos redundantes na raiz (`App.tsx`, `index.tsx`, etc.) que conflitavam com a versão em `src/`.
    *   **Admin & Loja**: Movidos todos os arquivos de código (`pages`, `components`, `services`, `hooks`, `context`) para `src/`.

## 2. O que foi Melhorado

*   **Consistência de Pastas**:
    *   Todos os projetos agora possuem as pastas padrão em `src/`:
        *   `components/`: Componentes React reutilizáveis.
        *   `pages/`: Componentes de página (rotas).
        *   `services/`: Lógica de negócios e chamadas API (Supabase).
        *   `types/`: Definições de tipos TypeScript (anteriormente arquivos soltos).
        *   `layouts/`: Estruturas de layout (adicionadas pastas onde faltavam).
        *   `hooks/`: Custom hooks (adicionada onde faltava).
        *   `context/`: Contextos globais (React Context).
*   **Padronização de Tipos**:
    *   Arquivos `types.ts` e `supabase-types.ts` foram movidos para a pasta `src/types/` (como `index.ts` e `supabase.ts`).
    *   Imports foram atualizados em todos os projetos para refletir essa mudança (`../types/supabase`).

## 3. Problemas Corrigidos

*   **Erros de Build (TypeScript)**:
    *   Corrigidos erros impeditivos no build do **Master**, incluindo propriedades faltantes em mocks (`slug`, `apiKey`, `planCode`).
    *   Corrigidas discrepâncias entre interfaces (`Tenant`) e dados mockados em `constants.ts`.
    *   Resolvidos conflitos de tipos do Supabase nos serviços (`tenantService`, `planService`) utilizando tratamento adequado para garantir a compilação.
*   **Configuração do Vite**:
    *   Atualizados `vite.config.ts` no Admin e Loja para configurar corretamente o alias `@` apontando para `./src`.
    *   Atualizados `index.html` de todos os projetos para apontar corretamente para o entrypoint `src/main.tsx` (padronizado de `index.tsx` para `main.tsx`).

## 4. Estrutura Ideal (Atual)

A arquitetura agora segue este padrão único para os três sistemas:

```
projeto/
├── src/
│   ├── components/  # Componentes visuais
│   ├── context/     # Gestão de estado global
│   ├── hooks/       # Hooks customizados
│   ├── layouts/     # Layouts de página
│   ├── pages/       # Rotas da aplicação
│   ├── services/    # Integração API/Supabase
│   ├── types/       # Definições TS
│   │   ├── index.ts # Tipos gerais
│   │   └── supabase.ts # Tipos gerados do banco
│   ├── App.tsx      # Componente raiz
│   ├── main.tsx     # Entrypoint
│   └── constants.ts # Constantes/Mocks
├── public/          # Assets estáticos
├── index.html       # HTML raiz
├── vite.config.ts   # Configuração de build
└── package.json     # Dependências
```

## 5. Responsabilidade dos Sistemas

*   **MASTER (Master System)**:
    *   **Foco**: Gestão "Super Admin" das farmácias.
    *   **Funções**: Criar tenants (farmácias), gerenciar planos, visualizar métricas globais, acessar admin/loja dos clientes.
    *   **Slug/Tenant**: Gerencia a **criação** do slug e chaves de API.

*   **ADMIN (Farma Vida Admin)**:
    *   **Foco**: Operação diária da farmácia específica.
    *   **Funções**: Gestão de estoque, vendas (PDV), equipe, configurações da loja.
    *   **Slug/Tenant**: Opera dentro do contexto de um único tenant (definido por login ou subdomínio/slug).

*   **LOJA (Farma Vida Store)**:
    *   **Foco**: Cliente final (e-commerce/PWA).
    *   **Funções**: Catálogo de produtos, carrinho, checkout, acompanhamento de pedidos.
    *   **Slug/Tenant**: Identifica a farmácia via URL (`/:slug`) para carregar o catálogo e branding corretos.

## 6. Próximos Passos Recomendados

*   Manter a disciplina de criar novos arquivos sempre dentro da pasta `src/` correta.
*   Utilizar `@/path` para imports relativos em Admin e Loja (configurado no Vite).
*   Ao alterar o banco de dados Supabase, atualizar `src/types/supabase.ts` em todos os projetos para manter a tipagem sincronizada.

---
*Relatório gerado automaticamente após análise e refatoração completa do ecossistema.*
