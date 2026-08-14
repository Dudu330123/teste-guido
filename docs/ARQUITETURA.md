# Arquitetura

## Visão geral

O Guido é um monólito modular Next.js conectado aos serviços gerenciados do Supabase. A mudança substitui a API C++ separada e está registrada no ADR-002.

```text
Navegador
   │
   ▼
Next.js / Vercel
   │ sessão, consultas e Route Handlers
   ▼
Supabase ── Auth
   ├─────── PostgreSQL + RLS
   └─────── Storage privado
```

O Next.js apresenta a interface e contém somente a coordenação necessária. PostgreSQL preserva integridade e autorização por linha, Storage guarda imagens e áudios e Supabase Auth é a autoridade de identidade. Não existe chave administrativa no navegador.

## Módulos

- `src/app`: rotas, Route Handlers, layout, metadados e manifesto;
- `src/features`: pesquisa, guias, progresso, histórico, tema e autenticação;
- `src/lib/supabase`: clientes, consultas tipadas e validação das respostas;
- `src/data`: fallback temporário exclusivo da demonstração fictícia;
- `supabase/migrations`: schema e políticas RLS versionados, aplicados manualmente;
- `supabase/seed.sql`: somente dados demonstrativos sem informações pessoais.

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

### Imagens demonstrativas publicadas pela administração

O fluxo ativo do painel usa `guide_public_images` e o bucket público
`guide-public`. Somente membros ativos com papel `superadmin` podem acessar o
painel e criar, substituir ou remover essas imagens. A publicação ocorre assim que o
upload termina, conforme decisão do produto; o visualizador continua exibindo que
se trata de demonstração não oficial. Aplicativo, plataforma e ordem do passo
fazem parte da chave para impedir mistura entre bancos ou celulares.

O visitante escolhe o aplicativo antes de abrir o guia. O servidor lê somente as
colunas públicas da imagem e substitui `imagePath`; título, instrução, alerta e
texto alternativo não são controlados pelo arquivo enviado.

## Fluxo público

Catálogo e guias são consultados no servidor Next.js com a chave publicável. RLS permite apenas conteúdo `published` e o `draft` explicitamente marcado como `is_demo`. Respostas são validadas antes de chegar aos componentes. Imagens e áudios permanecem em bucket privado e são entregues por URLs temporárias.

Sem configuração ou durante indisponibilidade, somente “Pagar um boleto” pode usar o fallback local identificado como demonstração. Guias reais nunca são inventados pelo frontend.

## Fluxo autenticado

O cookie da sessão é renovado pelo proxy do Next.js. Route Handlers chamam `auth.getUser()` antes de ler ou gravar progresso. As tabelas `profiles`, `user_progress` e `favorites` também usam RLS com `auth.uid()`, fornecendo defesa em profundidade. Visitantes continuam com progresso local sem dados sensíveis.

## Fluxo de conteúdo

1. editor cria um rascunho;
2. mídia permanece privada e passa por inspeção de formato, metadados e dados pessoais;
3. revisor humano compara origem, plataforma e versão;
4. aprovação e publicação são transacionais e auditadas;
5. API pública lê somente `published`;
6. conteúdo desatualizado é marcado sem apagar histórico necessário.

Nenhum guia pesquisado, importado ou gerado automaticamente é publicado.

## Evolução controlada

Operações administrativas futuras permanecem em Route Handlers ou Edge Functions pequenas, sempre com autorização explícita. Redis, workers, filas, IA e microsserviços ficam fora até existir necessidade mensurável. Python poderá existir futuramente apenas como processamento isolado de imagem/OCR, nunca como requisito da aplicação principal.

## Fora do escopo

Integração bancária, pagamento, leitura real de código, OCR, ações automáticas, credenciais bancárias, dados de boletos pessoais, aplicativos nativos, sobreposição de tela e publicação automática.
