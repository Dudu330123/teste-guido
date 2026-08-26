# Criar os agentes

Os comandos abaixo usam os workspaces versionados neste repositório. Substitua
`/CAMINHO/Guido` pelo caminho completo mostrado pelo comando `pwd` dentro da
pasta do projeto.

## 1. Conferir os arquivos

```bash
cd /CAMINHO/Guido
find openclaw/workspaces -name AGENTS.md -print
```

Devem aparecer seis arquivos.

## 2. Criar os seis perfis

Execute cada comando separadamente:

```bash
openclaw agents add guido-orquestrador --workspace /CAMINHO/Guido/openclaw/workspaces/guido-orquestrador --non-interactive
openclaw agents add guido-pesquisa --workspace /CAMINHO/Guido/openclaw/workspaces/guido-pesquisa --non-interactive
openclaw agents add guido-roteiro --workspace /CAMINHO/Guido/openclaw/workspaces/guido-roteiro --non-interactive
openclaw agents add guido-midia --workspace /CAMINHO/Guido/openclaw/workspaces/guido-midia --non-interactive
openclaw agents add guido-seguranca --workspace /CAMINHO/Guido/openclaw/workspaces/guido-seguranca --non-interactive
openclaw agents add guido-revisao --workspace /CAMINHO/Guido/openclaw/workspaces/guido-revisao --non-interactive
```

Não use `--bind` nesta primeira configuração. Canais como Telegram, WhatsApp ou
Discord não são necessários para preparar guias e ampliam a superfície de risco.

## 3. Conferir a criação

```bash
openclaw agents list
```

Os seis nomes precisam aparecer.

## 4. Aplicar os limites

Abra `~/.openclaw/openclaw.json`, faça uma cópia de segurança e **mescle** o
conteúdo de `config/openclaw.fragment.example.json5`. Não substitua o arquivo
inteiro, pois ele pode conter o provedor e outros agentes já configurados.

Depois execute:

```bash
openclaw doctor
openclaw gateway restart
openclaw gateway status
```

## 5. Testar sem banco de dados

```bash
openclaw agent --agent guido-pesquisa --message "Responda somente com seu papel, suas proibições e o status blocked. Não pesquise nem altere arquivos."
```

O teste é aprovado se o agente explicar que pesquisa fontes, não publica e não
usa dados reais. Faça o mesmo com os outros perfis antes de executar uma tarefa.
