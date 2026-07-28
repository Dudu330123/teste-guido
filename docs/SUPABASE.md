# Modelo inicial do Supabase — sujeito a revisão

Nenhuma migration foi criada. As entidades abaixo são uma proposta conceitual para discussão de produto, LGPD, RLS e auditoria antes de qualquer SQL.

- `profiles`: dados mínimos do usuário e preferência de sistema; relacionado a `auth.users`;
- `team_members`: vínculo entre usuários internos, equipe e papel;
- `applications`: catálogo, identificação e origem do logo;
- `tasks`: tarefas disponíveis por aplicativo;
- `guides`: variante versionada por tarefa e sistema operacional;
- `guide_steps`: ordem, instrução e referências de mídia;
- `user_progress`: progresso por usuário e versão do guia;
- `favorites`: associação de usuário a tarefa ou guia;
- `guide_reviews`: revisões humanas, parecer e status;
- `audit_logs`: eventos administrativos mínimos, sem conteúdo sensível.

## Configuração manual futura

1. Criar o projeto no painel oficial do Supabase.
2. Definir região e regras de acesso aprovadas pela equipe.
3. Copiar apenas Project URL e chave pública/anon para `.env.local`.
4. Configurar URLs locais e de produção no Supabase Auth.
5. Revisar o modelo e criar migrations versionadas localmente.
6. Aplicar RLS e testar negações antes de conectar dados reais.
7. Configurar Storage privado e limites antes de qualquer upload.

O cliente de servidor em `src/lib/supabase/server.ts` já aceita cookies, mas a renovação completa de sessão exigirá middleware quando autenticação passar a integrar rotas protegidas.
