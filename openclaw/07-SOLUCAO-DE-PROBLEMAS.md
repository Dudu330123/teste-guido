# Solução de problemas

## `openclaw: command not found`

Feche e abra o terminal. Execute novamente o instalador oficial se o problema
continuar. Não baixe instaladores de sites de terceiros.

## Gateway parado

```bash
openclaw gateway status
openclaw gateway restart
openclaw doctor
```

Copie a mensagem de erro completa, removendo chaves e tokens, antes de pedir
ajuda.

## Agente não aparece

```bash
openclaw agents list
```

Confira o caminho absoluto do workspace e repita apenas o comando do perfil que
faltou. Não apague outros agentes para tentar corrigir.

## Orquestrador não consegue chamar trabalhador

Confirme se os IDs são exatamente `guido-pesquisa`, `guido-roteiro`,
`guido-midia`, `guido-seguranca` e `guido-revisao`. Confira a lista
`allowAgents` no fragmento de configuração e execute `openclaw doctor`.

## Saída fora do schema

Não corrija silenciosamente nem envie ao Guido. Marque a execução como
`needs_review`, registre o erro e peça ao agente para gerar novamente respeitando
o contrato.

## Agente pediu credencial ou tentou publicar

Use `/stop`, revogue qualquer credencial que tenha sido exposta e registre o
incidente. Não reexecute até uma pessoa revisar o workspace e as permissões.

## Conteúdo contraditório

O revisor deve marcar `blocked` ou `needs_review`. Uma fonte oficial ausente ou
uma versão de aplicativo divergente não pode ser resolvida por adivinhação.
