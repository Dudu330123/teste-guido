# Arquitetura

## Visão geral

O Guido é um monólito modular Next.js. Nesta fase, catálogo, roteiros e imagens demonstrativas são versionados no próprio projeto; PostgreSQL, Auth e Storage do Supabase ficam preparados para a fase de integração posterior. O C++ permanece congelado como histórico.

```text
Navegador
   │ conteúdo estático + Route Handlers server-side
   ▼
Next.js
   ├── dados locais versionados
   ├── imagens em public/images/guide-screens
   └── IA e voz com chaves somente no servidor
```

O Next.js apresenta a interface e valida as fronteiras das APIs. Nenhuma chave de IA fica no navegador ou em URL; nenhum upload público altera o conteúdo em produção.

## Módulos

- `src/app`: rotas, Route Handlers, layout, metadados e manifesto;
- `src/features`: pesquisa, guias, progresso, histórico, tema e autenticação;
- `src/lib/supabase`: integração futura de Auth, catálogo e autorização;
- `src/lib/db`: pool PostgreSQL e consultas da aplicação;
- `src/lib/storage`: adaptador local com interface compatível com S3;
- `src/data`: fallback temporário e fonte reprodutível da migração inicial; o banco é a fonte principal em execução;
- `supabase/migrations`: schema e políticas RLS versionados, aplicados manualmente;
- `supabase/seed.sql`: somente dados demonstrativos sem informações pessoais.
- `openclaw`: manual, contratos e workspaces para futura automação externa, sem agente no runtime do Guido.

O diretório `backend/` está congelado como referência da implementação anterior. Não participa da execução nem da CI e será removido somente depois da validação completa da migração.

### Imagens de guias

O painel `/admin` funciona como prévia editorial. Os arquivos ficam em
`public/images/guide-screens`, o mapa é gerado por
`npm run importar-imagens` e `npm run validate-images` confirma assinatura,
tamanho, dimensões e referências. Não existe Route Handler de upload público.
Uma imagem só chega ao site por alteração versionada, revisão humana e deploy.
O aplicativo, guia, sistema operacional e ordem do passo são validados pelo
manifesto local.

## Fluxo público

Catálogo e guias locais são lidos do código e só podem navegar quando o estado editorial é `published`, com exceção da demonstração explicitamente marcada. Respostas de APIs são validadas antes de chegar aos componentes.

O Supabase não é requisito para esta fase local. Quando a integração for ativada,
o banco poderá substituir o fallback, mas deverá conservar a mesma regra de
publicação; um rascunho ou conteúdo liberado apenas para revisão nunca será
apresentado como publicado.

## Fluxo autenticado

Route Handlers validam a identidade do Supabase Auth antes de ler ou gravar progresso. A autorização de usuário, equipe e superadmin acontece explicitamente no servidor e é reforçada por RLS. Visitantes continuam com progresso local sem dados sensíveis.

## Fluxo de conteúdo

O fluxo editorial abaixo continua sendo o objetivo para os roteiros oficiais.
Nesta fase, não há publicação de mídia por usuário. Os prints demonstrativos são
arquivos locais e entram no site somente após revisão humana.

1. editor cria um rascunho;
2. mídia permanece privada e passa por inspeção de formato, metadados e dados pessoais;
3. revisor humano compara origem, plataforma e versão;
4. aprovação e publicação são transacionais e auditadas;
5. API pública lê somente `published`;
6. conteúdo desatualizado é marcado sem apagar histórico necessário.

Nenhum guia pesquisado, importado ou gerado automaticamente é publicado.

Agentes futuros devem gravar rascunhos no Supabase e enviar um alerta para
revisão humana. O contrato, os limites de concorrência e as regras para fontes
e imagens estão no [manual do OpenClaw](../openclaw/README.md); a automação não recebe
permissão para publicar versões oficiais por conta própria.

## Evolução controlada

Operações administrativas futuras permanecem em Route Handlers ou Edge Functions pequenas, sempre com autorização explícita. Redis, workers, filas, IA e microsserviços ficam fora até existir necessidade mensurável. Python poderá existir futuramente apenas como processamento isolado de imagem/OCR, nunca como requisito da aplicação principal.

## Fora do escopo

Integração bancária, pagamento, leitura real de código, OCR, ações automáticas, credenciais bancárias, dados de boletos pessoais, aplicativos nativos, sobreposição de tela e publicação automática.
