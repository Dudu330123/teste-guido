# Integração futura com o Guido

## Situação atual

O Guido já lê catálogo, versões, etapas e imagens do Supabase. Ele ainda **não**
possui uma API exclusiva para agentes criarem rascunhos nem um alerta editorial
produzido por automação. Portanto, configurar o OpenClaw não conecta os agentes
ao site automaticamente.

## Arquitetura necessária

```text
OpenClaw em outro computador
  → API autenticada do Guido
  → validação do contrato JSON
  → Supabase (somente draft/under_review)
  → alerta no painel
  → aprovação humana
  → published
```

## O que será implementado antes da conexão

1. identidade técnica exclusiva do agente;
2. endpoint servidor com autenticação, limite de requisições e auditoria;
3. validação dos schemas desta pasta;
4. permissão apenas para criar rascunhos e anexar candidatos de mídia;
5. idempotência para não duplicar guias quando uma tarefa for repetida;
6. alerta de revisão no painel do Guido;
7. bloqueio transacional de qualquer mudança para `published` feita pelo agente;
8. armazenamento privado de mídia até aprovação.

## Credenciais

O arquivo `config/guido-agent.env.example` contém apenas nomes futuros. Não o
preencha agora. A chave `service_role` do Supabase nunca deve ser fornecida ao
agente nem colocada no frontend. A opção recomendada é um token limitado para a
API do Guido, que por sua vez executa operações autorizadas no servidor.

## Banco e imagens

Textos entram em `guide_versions` e `steps` como rascunho. Imagens entram em uma
área privada de candidatos, com origem, licença, hash e etapa pretendida. Apenas
após revisão uma imagem pode virar mídia pública de um guia. Alterações no GitHub
ou novos deploys não devem apagar objetos já armazenados no Supabase Storage.
