# Checklist de implantação

## Computador

- [ ] OpenClaw instalado pelo domínio oficial;
- [ ] `openclaw doctor` sem erro;
- [ ] Gateway ativo;
- [ ] provedor de IA e orçamento definidos;
- [ ] nenhuma credencial dentro do repositório.

## Agentes

- [ ] seis agentes aparecem em `openclaw agents list`;
- [ ] cada perfil aponta para o workspace correto;
- [ ] concorrência global limitada a uma execução;
- [ ] orquestrador só pode chamar os cinco trabalhadores do Guido;
- [ ] cada agente passou pelo teste sem banco de dados.

## Segurança

- [ ] tarefa contém apenas dados fictícios;
- [ ] fontes permitidas estão explícitas;
- [ ] publicação automática permanece proibida;
- [ ] imagens possuem origem e permissão verificáveis;
- [ ] logs não contêm dados pessoais ou segredos.

## Antes da integração real

- [ ] API de rascunhos implementada e testada;
- [ ] autenticação técnica limitada;
- [ ] schemas validados no servidor;
- [ ] rate limiting e idempotência ativos;
- [ ] mídia permanece privada antes da aprovação;
- [ ] painel mostra alerta de revisão;
- [ ] agente não consegue definir `published`;
- [ ] auditoria registra criação, revisão e publicação.
