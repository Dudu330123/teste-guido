# Segurança e privacidade

## Ameaças principais

- conteúdo desatualizado induzir uma ação financeira incorreta;
- guia falso ou adulterado pedir senha, código ou pagamento;
- XSS em conteúdo administrativo futuro;
- sessão expirada, roubo de conta ou autorização inadequada;
- exposição de dados pessoais em imagens, logs ou uploads;
- dependências vulneráveis e configuração incorreta do Supabase.

## Priorização atual

| Risco | Prioridade | Controle atual |
| --- | --- | --- |
| Publicar guia financeiro falso ou sem revisão | Crítica | estados, `is_demo`, RLS e fluxo de revisão modelado; painel de publicação ainda não existe |
| Usuário acessar progresso de outra pessoa | Alta | identidade vem do Supabase Auth e `user_id` nunca vem do payload; RLS isola por `auth.uid()` |
| SQL injection | Alta | queries C++ parametrizadas e validações de fronteira |
| Vazamento de token | Alta | Bearer não é logado; proxy server-side; mensagens ocultam detalhes |
| Print com dado pessoal | Alta | mídia não está ativa; schema bloqueia publicação marcada com dado pessoal e exige revisão |
| XSS em conteúdo editorial | Média | React escapa texto, não há HTML arbitrário e CSP está ativa |
| CSRF | Média | mutação C++ usa Bearer; endpoints baseados em cookies devem continuar restritos ao BFF same-origin |
| Abuso e brute force | Média | Auth é delegado ao Supabase; rate limiting específico ainda precisa ser configurado antes de produção |
| Supply-chain | Média | CI usa Actions fixadas por commit, lockfile npm, warnings e sanitizers C++ |

## Dados proibidos

O Guido não deve coletar ou armazenar senha bancária, CPF usado numa operação, valor, beneficiário, linha digitável, código de barras, token, imagem pessoal de boleto ou conteúdo digitado em aplicativo financeiro. Senhas de conta Guido são enviadas diretamente ao Supabase Auth e nunca registradas em logs ou tabelas próprias.

## Regras para guias financeiros

- conteúdo sempre identificado por origem, app, sistema, versão e data;
- revisão humana obrigatória antes de `published`;
- alerta para conferir beneficiário, valor e vencimento;
- terminar antes de autenticação ou confirmação irreversível;
- nunca preencher, clicar, abrir deep link bancário ou alegar vínculo com instituição;
- marcar material desatualizado rapidamente.

## Imagens e uploads futuros

Aceitar apenas formatos e tamanhos permitidos, verificar MIME e conteúdo, usar nomes não controlados pelo usuário, remover metadados, procurar dados pessoais, armazenar em bucket privado durante revisão e liberar por URLs temporárias. Nunca reutilizar captura de cliente. Logos precisam de fonte oficial e não podem ter cor ou proporção alterada.

## Supabase

- somente URL e chave publishable (`sb_publishable_...`) no cliente;
- nunca expor `service_role`, senha do banco ou token administrativo;
- manter as chaves legadas `anon` e `service_role` desativadas quando nenhuma integração depender delas;
- habilitar RLS em toda tabela acessível pela API;
- validar a sessão com `auth.getUser()` no servidor antes de usar o `user.id`;
- renovar cookies com o `proxy.ts` do Next.js;
- políticas separadas para leitura publicada, autoria, revisão e administração;
- Storage privado para rascunhos e políticas por equipe;
- logs e auditoria sem segredos ou dados financeiros.

## Controles futuros

Rate limiting em mutações, políticas reais do bucket Storage, exclusão/exportação de conta conforme LGPD, retenção mínima, auditoria administrativa imutável e resposta a incidentes. CSP, proteção contra framing, política de permissões, `nosniff` e referrer policy já são emitidos. Mensagens públicas ocultam stack traces e detalhes internos.
