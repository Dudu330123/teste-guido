# Operação diária

## Antes de iniciar

1. atualize o repositório e leia mudanças nos workspaces;
2. confirme `openclaw doctor` e `openclaw gateway status`;
3. escolha somente uma tarefa e uma plataforma;
4. defina fontes permitidas e nível de risco;
5. remova qualquer dado pessoal da solicitação.

## Criar uma tarefa

Copie `contracts/guido-task.schema.json` como referência. Um exemplo mínimo:

```json
{
  "taskId": "manual-001",
  "tutorialSlug": "enviar-audio-whatsapp",
  "operatingSystem": "android",
  "objective": "Preparar um rascunho educativo para enviar áudio.",
  "allowedSources": ["https://faq.whatsapp.com/"],
  "riskLevel": "low",
  "requestedAt": "2026-08-26T12:00:00Z"
}
```

## Executar

Comece pelo orquestrador:

```bash
openclaw agent --agent guido-orquestrador --message-file tarefa.json
```

Se a versão instalada não aceitar `--message-file` nessa forma, copie o JSON e
use `--message`. Não conceda novas permissões apenas para contornar um erro.

## Acompanhar trabalhadores

No chat do OpenClaw, use:

```text
/subagents list
/subagents info <id>
/subagents log <id>
```

Pare a execução com `/stop` se um agente tentar acessar conta autenticada,
solicitar segredo, publicar ou usar material sem origem.

## Aceitar a entrega

A entrega deve respeitar `contracts/guido-result.schema.json`, conter fontes,
dúvidas e `humanReviewRequired: true`. Salve o arquivo fora de pastas públicas.
Até a API do Guido existir, a equipe deve transferir o conteúdo manualmente para
um rascunho e registrar a revisão.
