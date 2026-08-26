# Preparação para agentes de IA

Este documento orienta a equipe que futuramente configurará Hermes, OpenClaw ou
outro orquestrador. Nenhum agente é instalado ou executado pelo Guido neste
momento.

## Objetivo

Os agentes devem acelerar a pesquisa e a preparação de guias, mas o Guido
continua sendo a aplicação que exibe o conteúdo e controla a publicação. O
resultado de qualquer automação deve entrar como rascunho no Supabase e gerar um
alerta para revisão humana.

## Arquitetura recomendada

Use um agente orquestrador e trabalhadores especializados, executados em
sequência por padrão:

```text
Orquestrador
  ├─ Pesquisa oficial
  ├─ Roteiro Android/iPhone
  ├─ Mídia e direitos de uso
  └─ Verificação de segurança e consistência
           ↓
      draft no Supabase
           ↓
      alerta para revisão humana
           ↓
      publicação manual
```

Pesquisa de fontes independentes pode ocorrer em paralelo quando isso reduzir o
tempo. Os agentes não devem editar simultaneamente a mesma versão de guia.

## Contrato de cada agente

Todo agente deve receber uma tarefa explícita contendo `tutorial_slug`,
`sistema_operacional`, objetivo, fontes permitidas e prazo. A resposta deve
incluir:

- status (`completed`, `needs_review` ou `blocked`);
- resumo objetivo;
- fontes, URL e data de consulta;
- alterações propostas;
- dúvidas e informações não confirmadas;
- chaves editoriais das imagens, quando houver;
- indicação de dados sensíveis encontrados e removidos.

O agente não deve retornar texto livre para ser publicado diretamente. O
orquestrador deve validar o formato antes de persistir.

## Estado no banco

- `tutorials`: tarefa e metadados do catálogo;
- `guide_versions`: variante Android/iPhone e estado editorial;
- `steps`: texto ordenado e `editorial_key` estável;
- `guide_public_images`: referências dos prints públicos;
- `guide_reviews`: parecer humano;
- `audit_logs`: eventos sem senha, CPF, valores ou conteúdo bancário.

Um agente pode criar ou atualizar uma versão `draft` ou `under_review`, conforme
o contrato definido pela equipe. Somente uma pessoa autorizada deve alterar
para `published`. `public_for_upload` permite preparar imagens sem liberar o
guia como tutorial oficial.

## Regras de segurança

- nunca acessar contas bancárias, Gov.br ou aplicativos autenticados;
- nunca usar credenciais, CPF, senha, token, valor ou beneficiário reais;
- não capturar imagens com dados pessoais;
- não copiar automaticamente telas de terceiros sem permissão ou fonte válida;
- não usar `dangerouslySetInnerHTML` nem inserir HTML gerado pelo modelo;
- não apagar versões, imagens ou auditoria;
- não publicar automaticamente conteúdo financeiro ou de serviços públicos;
- registrar falhas e interromper quando houver dúvida.

As chaves administrativas do Supabase devem ficar somente no ambiente do
orquestrador, fora do navegador e fora do Git. Para escrita, prefira um endpoint
servidor com autorização restrita e validação; não conceda ao agente acesso
irrestrito ao banco sem necessidade.

## Configuração futura no OpenClaw

O limite inicial recomendado é baixo para controlar custo e concorrência:

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 1,
        maxChildrenPerAgent: 4,
        maxSpawnDepth: 1
      }
    }
  }
}
```

O OpenClaw permite aumentar esses limites, mas isso só deve ocorrer após medir
tempo, custo e colisões. Os agentes especializados podem ser perfis separados
ou subagentes temporários; não é necessário manter todos ativos.

## Configuração futura no Hermes

No Hermes, perfis separados isolam memória, sessões e chaves. Uma alternativa é
um perfil orquestrador usar `delegate_task` para trabalhadores temporários. Cada
subagente deve receber todo o contexto necessário, pois não herda a conversa do
orquestrador automaticamente. Use um modelo econômico para pesquisa e reserve
modelos mais fortes para síntese e verificação.

## Fluxo de aprovação

1. o orquestrador cria uma tarefa de conteúdo;
2. trabalhadores entregam resultados com fontes;
3. o servidor valida schema, slug, plataforma e chaves editoriais;
4. o Supabase salva a versão como `draft`;
5. o Guido exibe um alerta de revisão;
6. um revisor confere texto, imagens, fontes e segurança;
7. somente o revisor publica ou devolve para correção.

Não criar uma tabela ou endpoint de “publicação automática” sem uma decisão
explícita de produto, regras de autorização e auditoria.

## Checklist para a equipe

- [ ] definir o provedor e o orçamento de modelos;
- [ ] criar o workspace do agente fora do frontend;
- [ ] configurar variáveis Supabase sem credenciais no repositório;
- [ ] implementar validação de saída com schema;
- [ ] limitar ferramentas por agente;
- [ ] testar com dados fictícios;
- [ ] registrar fontes e direitos de uso das imagens;
- [ ] enviar alerta de aprovação ao Guido;
- [ ] testar rejeição, correção, repetição e timeout;
- [ ] revisar RLS, logs e exclusão de dados antes de produção.
