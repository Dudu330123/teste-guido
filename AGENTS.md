# Instruções para futuras execuções do Codex

- Analise o ambiente, este arquivo e o estado do projeto antes de alterar qualquer coisa.
- Faça mudanças pequenas, verificáveis e preserve funcionalidades existentes.
- Comente contratos públicos e decisões não óbvias de arquitetura, segurança e
  regras de negócio. Explique o motivo da decisão, não apenas o que a linha faz,
  e mantenha os comentários atualizados junto com o código.
- Não adicione dependências sem necessidade e justificativa registradas.
- Nunca execute comandos destrutivos ou apague arquivos sem autorização explícita.
- Não faça commit, push, deploy nem crie repositório remoto.
- Não crie projeto Supabase automaticamente nem execute migrations destrutivas.
- Execute `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` antes de concluir.
- Registre no relatório final todos os arquivos alterados e criados.
- Documente riscos, limitações, débitos técnicos e falhas não resolvidas.
- Nunca use dados bancários reais, credenciais, CPF, valores, boletos ou imagens pessoais.
- Nunca publique guia não revisado como oficial; pesquisa e automação exigem validação humana.
- Não use `dangerouslySetInnerHTML`, não reduza TypeScript estrito e não desative regras para ocultar erros.

## Comando de publicação `/public`

Quando a mensagem do usuário for `/public` (ou começar com `/public`), trate-a
como autorização explícita para executar `bash scripts/public` na raiz deste
repositório. O fluxo busca as branches remotas, mostra o resumo das alterações,
integra na `main` apenas branches ainda não incorporadas, executa lint, tipos,
testes e build e faz push para `origin/main`, acionando o deploy automático pela
integração Git da Vercel.

O script ignora branches com prefixos `backup/` e `agent/`, nunca faz force push,
reset destrutivo ou publica com a árvore suja. Em qualquer conflito ou falha,
deve parar e relatar o comando, o erro e a ação recomendada. Se não houver
alteração nova, um commit vazio identificável pode ser usado para solicitar um
novo deploy. O deploy direto pela CLI da Vercel, criação de tokens e alterações
fora deste repositório continuam fora do escopo.
