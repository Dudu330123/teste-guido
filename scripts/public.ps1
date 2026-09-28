# PowerShell version of the public publication script
# Mirrors the behavior of scripts/public (Bash) and can be run in PowerShell.
# Usage: .\scripts\public.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Fail {
    param([string]$Message)
    Write-Error "Erro: $Message"
    exit 1
}

# Determine project root (parent of the script directory)
$projectDir = Resolve-Path -Path "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\.."
Set-Location $projectDir

# Verify we are inside a git repository
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) { Fail 'Esta pasta não é um repositório Git.' }
if ($repoRoot -ne $projectDir) { Fail "O script deve ser executado na raiz $projectDir" }

# Ensure we are on main branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne 'main') { Fail 'Mude para a branch main antes de publicar.' }

# Ensure working tree is clean
if ((git status --porcelain).Trim()) { Fail 'A árvore de trabalho não está limpa; preserve suas alterações e tente novamente.' }

# Ensure no merge in progress
if (git rev-parse -q --verify MERGE_HEAD 2>$null) { Fail 'Há um merge em andamento; conclua ou aborte‑lo manualmente antes de publicar.' }

# Ensure remote origin exists
if (-not (git remote get-url origin 2>$null)) { Fail 'O remoto origin não está configurado.' }

Write-Host 'Buscando branches remotas...'
git fetch --prune origin '+refs/heads/*:refs/remotes/origin/*'
if (-not (git show-ref --verify --quiet refs/remotes/origin/main)) { Fail 'origin/main não foi encontrado após o fetch.' }

# Fast‑forward local main to origin/main
if (-not (git merge --ff-only origin/main 2>$null)) {
    Fail 'main local diverge de origin/main; reconcilie o histórico manualmente (sem force push).'
}

$initialHead = git rev-parse HEAD
$candidates = @()
# List remote branches excluding protected ones
git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | ForEach-Object {
    $ref = $_
    switch ($ref) {
        'origin/main' { return }
        'origin/HEAD' { return }
        { $_ -like 'origin/backup/*' } { return }
        { $_ -like 'origin/agent/*' } { return }
    }
    if (-not (git merge-base --is-ancestor $ref HEAD)) { $candidates += $ref }
}

if ($candidates.Count -eq 0) {
    Write-Host 'Nenhuma branch nova de colaborador encontrada.'
} else {
    Write-Host "Branches candidatas ($($candidates.Count)):`n"
    foreach ($ref in $candidates) {
        Write-Host "--- $ref ---"
        git log --oneline --decorate --no-renames "HEAD..$ref"
        git diff --stat "HEAD...$ref" || $null
    }
}

# Dry‑run mode (optional)
if ($env:PUBLIC_DRY_RUN -eq '1') {
    Write-Host 'Modo de simulação: nenhuma integração, validação, commit ou publicação foi executada.'
    exit 0
}

# Merge candidate branches
foreach ($ref in $candidates) {
    Write-Host "`nIntegrando $ref..."
    if (-not (git merge --no-edit $ref 2>$null)) {
        git merge --abort 2>$null
        Fail "Não foi possível integrar $ref; o merge foi abortado e nenhuma branch foi forçada."
    }
}

# Lint, typecheck, test, build
Write-Host '`nExecutando lint...'
npm run lint
Write-Host '`nVerificando tipos...'
npm run typecheck
Write-Host '`nExecutando testes...'
npm test -- --run
Write-Host '`nConstruindo produção com Webpack...'
npm run build -- --webpack

# If nothing changed, create an empty commit to trigger Vercel deploy
if ((git rev-parse HEAD) -eq $initialHead) {
    git commit --allow-empty -m 'chore: acionar deploy da Vercel'
}

git push origin main
Write-Host "`nPublicado em origin/main: $(git rev-parse --short HEAD)"
Write-Host 'O deploy será iniciado pela integração Git da Vercel.'
