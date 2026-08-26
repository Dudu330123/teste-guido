# OpenClaw para o Guido

Este diretório é um kit de preparação para a equipe que criará os agentes do
Guido em outro computador. Ele foi escrito para pessoas sem experiência com
agentes de IA.

> Importante: os agentes ainda não estão conectados ao Supabase nem podem criar
> rascunhos dentro do Guido. Os arquivos desta pasta preparam os papéis, os
> limites e o formato dos dados. A conexão só funcionará após a implementação de
> uma API segura de entrada de rascunhos.

## O que é cada coisa

- **OpenClaw:** programa que executa e coordena agentes.
- **Agente:** perfil com uma responsabilidade e regras próprias.
- **Workspace:** pasta de trabalho de um agente. Seu arquivo principal é
  `AGENTS.md`.
- **Orquestrador:** agente que distribui tarefas e reúne os resultados.
- **Rascunho:** conteúdo que ainda precisa de aprovação humana.

## Fluxo recomendado

```text
Orquestrador
  → Pesquisa
  → Roteiro
  → Mídia
  → Segurança
  → Revisão
  → rascunho aguardando aprovação humana
```

Os trabalhadores rodam em sequência. Isso reduz custo, evita versões
concorrentes do mesmo guia e facilita descobrir onde ocorreu um erro.

## Ordem de leitura

1. [Conceitos e responsabilidades](01-CONCEITOS.md)
2. [Instalação](02-INSTALACAO.md)
3. [Criação dos agentes](03-CRIAR-AGENTES.md)
4. [Operação diária](04-OPERACAO.md)
5. [Integração futura com o Guido](05-INTEGRACAO-GUIDO.md)
6. [Segurança e aprovação](06-SEGURANCA.md)
7. [Solução de problemas](07-SOLUCAO-DE-PROBLEMAS.md)
8. [Checklist final](CHECKLIST.md)

## Arquivos prontos

- `workspaces/*/AGENTS.md`: instruções independentes para cada agente;
- `config/openclaw.fragment.example.json5`: limites recomendados para mesclar
  na configuração existente;
- `config/guido-agent.env.example`: nomes das variáveis da integração futura,
  sem credenciais;
- `contracts/guido-task.schema.json`: formato de uma tarefa recebida;
- `contracts/guido-result.schema.json`: formato da entrega de um agente.
- `examples/task.example.json` e `examples/result.example.json`: exemplos
  preenchidos somente com dados fictícios.

## Regras que não podem ser alteradas

- agentes nunca publicam um guia automaticamente;
- agentes nunca acessam contas bancárias, Gov.br ou aplicativos autenticados;
- agentes nunca usam CPF, senha, token, boleto, beneficiário ou valor real;
- imagens de terceiros exigem origem e direito de uso verificáveis;
- toda entrega termina como rascunho e exige revisão humana;
- nenhuma chave secreta entra no Git, no navegador ou nos textos dos agentes.

Documentação oficial usada como referência: [instalação](https://docs.openclaw.ai/install),
[gerenciamento de agentes](https://docs.openclaw.ai/cli/agents),
[workspaces](https://docs.openclaw.ai/agent-workspace) e
[subagentes](https://docs.openclaw.ai/tools/subagents).
