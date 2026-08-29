# Comando `/public`

`/public` é o fluxo de publicação do Guido. A regra está registrada no
`AGENTS.md` para que futuras execuções do Codex a reconheçam automaticamente.

## O que acontece

1. A árvore de trabalho precisa estar limpa e a branch atual precisa ser `main`.
2. O script busca as branches de `origin` e lista commits e resumo de diferenças
   que ainda não estão na `main`.
3. Branches com prefixos `backup/` e `agent/` são ignoradas por segurança.
4. Cada branch candidata é integrada com merge normal. Conflitos abortam o
   fluxo sem force push e devem ser resolvidos manualmente.
5. São executados lint, verificação de tipos, testes e build.
6. O push para `origin/main` aciona o deploy pela integração Git da Vercel. Se
   não houver alterações novas, é criado um commit vazio somente para solicitar
   novo deploy.

Execute manualmente com:

```bash
npm run public
```

Para apenas consultar branches sem integrar, validar, criar commit ou publicar:

```bash
PUBLIC_DRY_RUN=1 npm run public
```

## Limitação do comando visual

O diretório `.agents` deste ambiente é somente leitura, então não foi possível
instalar um skill local que apareça como item nativo no menu de `/`. O fluxo
executável e a regra persistente do projeto estão prontos; no aplicativo, um
prompt visual personalizado pode aparecer como `/prompts:public` quando criado
nas configurações de prompts. Digitar `/public` nesta conversa continua sendo o
gatilho documentado pelo `AGENTS.md`.
