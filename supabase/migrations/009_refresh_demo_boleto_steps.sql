-- Atualiza somente o guia demonstrativo em rascunho. A pesquisa institucional
-- melhora o núcleo comum, mas não constitui revisão humana de telas específicas.
update public.guide_versions
set guide_version = '0.2-research'
where id in (
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002'
)
and status = 'draft';

update public.steps as step
set
  title = content.title,
  instruction = content.instruction,
  image_alt = content.image_alt,
  warning = content.warning,
  confirmation_message = content.confirmation_message
from (values
  (1::smallint, 'Abra o aplicativo oficial',
   'Confirme o nome do seu banco e toque no aplicativo oficial para abri-lo.',
   'Tela inicial demonstrativa de celular com o aplicativo oficial do banco destacado.',
   null::text, null::text),
  (2::smallint, 'Encontre a área de pagamento',
   'Depois de entrar na sua conta, procure Pagamentos, Pagar ou Pagar e transferir.',
   'Tela bancária demonstrativa com a área de pagamento destacada.',
   null::text, null::text),
  (3::smallint, 'Escolha pagar boleto',
   'Toque em Boleto, Código de barras ou uma opção com nome parecido.',
   'Área demonstrativa de pagamentos com a opção de boleto ou código de barras destacada.',
   null::text, null::text),
  (4::smallint, 'Informe o código no banco',
   'No aplicativo do banco, escolha ler o código com a câmera ou digitar os números do boleto.',
   'Tela demonstrativa oferecendo leitura por câmera ou digitação do código, sem dados reais.',
   null::text, null::text),
  (5::smallint, 'Confira antes de pagar',
   'Compare o nome de quem receberá, o valor e o vencimento com o boleto. Se algo estiver diferente, pare.',
   'Tela demonstrativa de conferência com beneficiário, valor e vencimento fictícios.',
   'Não continue se o aplicativo mostrar um recebedor ou valor diferente do boleto.',
   null::text),
  (6::smallint, 'Pare antes de confirmar',
   'O guia termina aqui, antes da senha e da confirmação. Só continue no banco se todos os dados estiverem corretos.',
   'Aviso de segurança indicando que o Guido não realiza nem confirma pagamentos.',
   'Confira cuidadosamente o nome de quem receberá, o valor e o vencimento. O Guido nunca pede sua senha e nunca confirma pagamentos por você.',
   'Demonstração concluída sem realizar qualquer operação bancária.')
) as content(position, title, instruction, image_alt, warning, confirmation_message)
where step.guide_version_id in (
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002'
)
and step.position = content.position;
