# Arquitetura

## Visão geral

O Guido é um monólito modular Next.js com autenticação própria, PostgreSQL independente e adaptador de Storage local/S3. O C++ permanece congelado como histórico.

```text
Navegador
   │ cookies HttpOnly
   ▼
Next.js / Route Handlers
   ├── Auth Guido + autorização server-side
   ├── PostgreSQL via adapter
   └── Storage local/S3 via adapter
```

O Next.js apresenta interface, autentica sessões e aplica autorização server-side. PostgreSQL preserva integridade e relações; Storage guarda imagens e áudios. Nenhum token de autenticação fica em localStorage.

## Módulos

- `src/app`: rotas, Route Handlers, layout, metadados e manifesto;
- `src/features`: pesquisa, guias, progresso, histórico, tema e autenticação;
- `src/lib/auth`: hashing, sessões, email, OAuth e autorização;
- `src/lib/db`: pool PostgreSQL e consultas da aplicação;
- `src/lib/storage`: adaptador local com interface compatível com S3;
- `src/lib/supabase`: nomes históricos de módulos de catálogo, sem SDK Supabase;
- `src/data`: fallback temporário e fonte reprodutível da migração inicial; o banco é a fonte principal em execução;
- `supabase/migrations`: schema e políticas RLS versionados, aplicados manualmente;
- `supabase/seed.sql`: somente dados demonstrativos sem informações pessoais.
- `openclaw`: manual, contratos e workspaces para futura automação externa, sem agente no runtime do Guido.

O diretório `backend/` está congelado como referência da implementação anterior. Não participa da execução nem da CI e será removido somente depois da validação completa da migração.

### Rascunhos de prints no painel administrativo

A rota `/admin` pode ser aberta no navegador, mas leitura, envio e remoção de
prints exigem uma sessão válida e um vínculo ativo em `team_members`. O Route
Handler valida novamente a sessão; PostgreSQL e Storage aplicam RLS como segunda
camada. Não existe chave administrativa no processo.

Cada rascunho usa uma identidade composta por guia, aplicativo quando aplicável,
sistema operacional e passo. Essa separação impede que um print da Caixa, por
exemplo, substitua o print correspondente do Banco do Brasil. A coleção IndexedDB
anterior foi preservada no código para evitar uma exclusão silenciosa, mas não é
mais lida pelo painel e não é migrada automaticamente.

Os arquivos ficam no bucket privado `guide-drafts`; `guide_image_drafts` guarda
somente contexto, dimensões, autoria e chave do objeto. O HTML recebe uma URL
assinada por uma hora. A apresentação usa contenção proporcional para adaptar
prints verticais ou horizontais sem corte. Esses registros são rascunhos e não
entram no fluxo público sem revisão separada.

### Imagens demonstrativas publicadas por visitantes

O fluxo ativo do painel usa `guide_public_images` e o bucket público
`guide-public`. Somente o `superadmin` pode criar, substituir ou remover essas imagens pela rota `/enviar-print`. A publicação ocorre assim que o upload termina; o visualizador continua exibindo que
se trata de demonstração não oficial. Aplicativo, plataforma e ordem do passo
fazem parte da chave para impedir mistura entre bancos ou celulares.

Cada registro também pode apontar para `guide_versions` e `steps`. Esses vínculos
foram adicionados sem mudar `storage_bucket` ou `storage_key`, portanto deploys e
edições do catálogo não apagam os prints. A chave editorial do passo e o
`image_context_slug` do tutorial preservam a associação entre conteúdo, banco e
sistema operacional.

O visitante escolhe o aplicativo antes de abrir o guia. O servidor lê somente as
colunas públicas da imagem e substitui `imagePath`; título, instrução, alerta e
texto alternativo não são controlados pelo arquivo enviado.

## Fluxo público

Catálogo e guias são consultados no servidor Next.js com a chave publicável. RLS permite o catálogo público e somente versões `published` ou a demonstração explicitamente marcada. Roteiros em revisão podem ser lidos apenas pela ferramenta de envio quando `public_for_upload = true`; isso não os torna navegáveis. Respostas são validadas antes de chegar aos componentes.

Sem configuração ou durante indisponibilidade, o catálogo e a demonstração usam
o fallback local identificado. O banco volta a ser preferido automaticamente
quando disponível. Guias reais em rascunho nunca são apresentados como
publicados pelo frontend.

## Fluxo autenticado

Route Handlers validam hash de sessão e expiração antes de ler ou gravar progresso. A autorização de usuário, equipe e superadmin acontece explicitamente no servidor. Visitantes continuam com progresso local sem dados sensíveis.

## Fluxo de conteúdo

O fluxo editorial abaixo continua sendo o objetivo para os roteiros oficiais.
No MVP, os **prints demonstrativos** são uma exceção explícita: qualquer conta
autenticada pode enviá-los ou substituí-los e a imagem fica pública
imediatamente, sem aprovação do superadmin. Isso não muda o status editorial do
roteiro nem transforma o guia em conteúdo oficial ou validado.

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
