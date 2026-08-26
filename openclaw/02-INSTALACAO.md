# Instalação do OpenClaw

Use um computador separado para a automação. Não execute estes comandos no
servidor de produção do Guido.

## 1. Preparar o computador

É necessário macOS, Linux, Windows ou WSL2 e acesso ao terminal. O instalador
oficial prepara uma versão compatível do Node.js quando necessário.

## 2. Instalar

No Linux, macOS ou WSL2:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

No Windows PowerShell:

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

Esses comandos vêm da [documentação oficial](https://docs.openclaw.ai/install).
Antes de executá-los, uma pessoa responsável deve confirmar que o domínio no
comando é exatamente `openclaw.ai`.

## 3. Confirmar a instalação

Abra um terminal novo e execute, uma linha por vez:

```bash
openclaw --version
openclaw doctor
openclaw gateway status
```

Todos devem terminar sem erro. Se `openclaw` não for encontrado, feche e abra o
terminal e consulte [Solução de problemas](07-SOLUCAO-DE-PROBLEMAS.md).

## 4. Configurar o provedor de IA

Execute:

```bash
openclaw onboard --install-daemon
```

Siga o assistente e informe apenas uma chave de provedor criada para este
projeto. Nunca copie a chave para o repositório Guido, para mensagens ou para
arquivos `AGENTS.md`.

## 5. Obter o Guido

No computador dos agentes:

```bash
git clone https://github.com/castroo00/guido.git
cd guido
```

Se a pasta já existir, não clone novamente. Entre nela e execute `git pull`
somente quando não houver alterações locais que precisem ser preservadas.
