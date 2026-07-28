# Arquitetura

## Visão geral

O MVP é um monólito modular em Next.js. Rotas do App Router compõem módulos de interface e dados locais. Componentes de cliente são usados somente quando há interação com navegador, como pesquisa, síntese de voz, seleção de aparelho, Auth e `localStorage`.

```text
App Router → features/components → data + types
                         ├──────→ progress storage (localStorage)
                         └──────→ Supabase client (opcional)
```

## Módulos

- `src/app`: rotas, layout, metadados e manifesto PWA inicial;
- `src/components`: cabeçalho compartilhado;
- `src/features/applications`: apresentação do catálogo;
- `src/features/search`: busca local demonstrativa;
- `src/features/guides`: seleção de sistema, placeholder e visualizador;
- `src/features/progress`: navegação pura e adaptador de armazenamento;
- `src/features/auth`: formulários e mensagens de autenticação;
- `src/lib/supabase`: clientes browser/server opcionais;
- `src/lib/validation`: schemas de fronteira;
- `src/data`: catálogo e guia fictício;
- `src/types`: contratos mínimos de conteúdo e progresso.

## Fluxos de dados

Na busca, dados estáticos chegam do Server Component e são filtrados no cliente. No guia, a rota valida o sistema operacional, resolve guia e passos locais e entrega os dados ao visualizador. O visualizador valida todo progresso lido antes de usá-lo e persiste somente campos permitidos. Formulários validam entradas antes de chamar Supabase Auth; sem configuração, exibem mensagem amigável.

## Responsabilidades e limites

O Next.js concentra interface e futuro backend. Supabase será responsável por identidade, PostgreSQL e Storage. O navegador é responsável por síntese de voz e progresso temporário. Conteúdo de guias precisa de autoria e revisão humana; pesquisa não publica conteúdo automaticamente.

## Decisões arquiteturais

- Server Components por padrão e Client Components nas fronteiras interativas;
- tipos de domínio independentes de Supabase;
- adaptador de progresso separado para futura troca por repositório remoto;
- dados demonstrativos explícitos e sem HTML arbitrário;
- versões Android e iOS representadas como guias separados;
- dependências pequenas e com finalidade direta.

## Evolução prevista

Após revisão do modelo, Supabase poderá persistir conteúdo, progresso autenticado e imagens revisadas, com RLS e trilha de auditoria. Uma PWA poderá adicionar ícones, service worker, estratégia offline e testes de atualização. Python poderá surgir futuramente em processamento assíncrono isolado para anonimização, OCR ou comparação, mas não está instalado nem pertence ao MVP atual.

## Fora do escopo

Pagamentos, integrações bancárias, leitura de código, OCR, automação de toque, dados financeiros, painel administrativo completo, migrations definitivas, aplicativos nativos, sobreposição de tela, agentes e publicação automática.
