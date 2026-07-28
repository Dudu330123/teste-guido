# Segurança e privacidade

## Ameaças principais

- conteúdo desatualizado induzir uma ação financeira incorreta;
- guia falso ou adulterado pedir senha, código ou pagamento;
- XSS em conteúdo administrativo futuro;
- sessão expirada, roubo de conta ou autorização inadequada;
- exposição de dados pessoais em imagens, logs ou uploads;
- dependências vulneráveis e configuração incorreta do Supabase.

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

- somente URL e chave pública/anon no cliente;
- nunca expor `service_role`, senha do banco ou token administrativo;
- habilitar RLS em toda tabela acessível pela API;
- validar sessão no servidor e autorização por recurso;
- usar cookies seguros e middleware para renovação quando Auth for ativado;
- políticas separadas para leitura publicada, autoria, revisão e administração;
- Storage privado para rascunhos e políticas por equipe;
- logs e auditoria sem segredos ou dados financeiros.

## Controles futuros

Rate limiting em Auth e mutações, proteção CSRF para endpoints baseados em cookie, CSP, cabeçalhos de segurança, exclusão/exportação de conta conforme LGPD, retenção mínima, auditoria administrativa imutável e resposta a incidentes. Mensagens públicas devem ocultar stack traces e detalhes internos.
