# Arquitetura

## Visão geral

O Guido é um monólito modular Next.js conectado aos serviços gerenciados do Supabase. A mudança substitui a API C++ separada e está registrada no ADR-002.

```text
Navegador
   │
   ▼
Next.js / Netlify
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

### Rascunhos de prints no painel experimental

A rota `/admin` permanece temporariamente sem autenticação a pedido do produto,
por isso não possui permissão de escrita remota. Os arquivos escolhidos são
validados e guardados como `Blob` no IndexedDB do próprio navegador. Esse fluxo
permite revisar proporção e associação com cada passo sem criar uma porta pública
de upload.

Cada rascunho usa uma identidade composta por guia, aplicativo quando aplicável,
sistema operacional e passo. Essa separação impede que um print da Caixa, por
exemplo, substitua o print correspondente do Banco do Brasil. A coleção local
anterior foi preservada para evitar exclusão silenciosa de arquivos já escolhidos.

Após autenticação e autorização por `team_members`, os arquivos migrarão para o
bucket privado do Supabase Storage. O PostgreSQL guardará somente metadados e a
chave do objeto; o HTML nunca incorporará o conteúdo binário. A apresentação usa
contenção proporcional para adaptar prints verticais ou horizontais sem corte.

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
