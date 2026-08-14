begin;

insert into public.categories (id, name, slug, description)
values ('10000000-0000-4000-8000-000000000001', 'Serviços financeiros',
        'servicos-financeiros', 'Orientações educativas sobre aplicativos financeiros.');

insert into public.applications (
  id, category_id, name, slug, description, status, is_demo
) values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Banco — demonstração',
  'banco-demonstracao',
  'Exemplo educativo genérico, sem vínculo com qualquer banco.',
  'draft',
  true
);

insert into public.tutorials (
  id, application_id, category_id, title, slug, description, difficulty,
  safety_warning, status, is_demo
) values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Pagar um boleto',
  'pagar-boleto',
  'Aprenda a reconhecer as etapas comuns, sem realizar um pagamento.',
  'medium',
  'Conteúdo demonstrativo, não oficial e pendente de validação humana.',
  'draft',
  true
);

insert into public.tutorial_search_terms (tutorial_id, term) values
  ('30000000-0000-4000-8000-000000000001', 'boleto'),
  ('30000000-0000-4000-8000-000000000001', 'pagar conta'),
  ('30000000-0000-4000-8000-000000000001', 'código de barras'),
  ('30000000-0000-4000-8000-000000000001', 'linha digitável');

insert into public.guide_versions (
  id, tutorial_id, platform, app_version, guide_version, status, estimated_minutes
) values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
   'android', 'genérica', '0.2-research', 'draft', 4),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001',
   'ios', 'genérica', '0.2-research', 'draft', 4);

insert into public.steps (
  guide_version_id, position, title, instruction, image_alt, warning, confirmation_message
)
select
  guide.id,
  content.position,
  content.title,
  content.instruction,
  content.image_alt,
  content.warning,
  content.confirmation_message
from public.guide_versions guide
cross join (values
  (1::smallint, 'Abra o aplicativo oficial',
   'Confirme o nome do seu banco e toque no aplicativo oficial para abri-lo.',
   'Tela inicial demonstrativa de celular com o aplicativo oficial do banco destacado.',
   null::text, null::text),
  (2::smallint, 'Encontre a área de pagamento',
   'Depois de entrar na sua conta, procure Pagamentos, Pagar ou Pagar e transferir.',
   'Tela bancária demonstrativa com a área de pagamento destacada.', null::text, null::text),
  (3::smallint, 'Escolha pagar boleto',
   'Toque em Boleto, Código de barras ou uma opção com nome parecido.',
   'Área demonstrativa de pagamentos com a opção de boleto ou código de barras destacada.', null::text, null::text),
  (4::smallint, 'Informe o código no banco',
   'No aplicativo do banco, escolha ler o código com a câmera ou digitar os números do boleto.',
   'Tela demonstrativa oferecendo leitura por câmera ou digitação do código, sem dados reais.',
   null::text, null::text),
  (5::smallint, 'Confira antes de pagar',
   'Compare o nome de quem receberá, o valor e o vencimento com o boleto. Se algo estiver diferente, pare.',
   'Tela demonstrativa de conferência com beneficiário, valor e vencimento fictícios.',
   'Não continue se o aplicativo mostrar um recebedor ou valor diferente do boleto.', null::text),
  (6::smallint, 'Pare antes de confirmar',
   'O guia termina aqui, antes da senha e da confirmação. Só continue no banco se todos os dados estiverem corretos.',
   'Aviso de segurança indicando que o Guido não realiza nem confirma pagamentos.',
   'Confira cuidadosamente o nome de quem receberá, o valor e o vencimento. O Guido nunca pede sua senha e nunca confirma pagamentos por você.',
   'Demonstração concluída sem realizar qualquer operação bancária.')
) as content(position, title, instruction, image_alt, warning, confirmation_message)
where guide.tutorial_id = '30000000-0000-4000-8000-000000000001';

-- Este seed é somente para desenvolvimento local. O conteúdo permanece draft e não
-- deve ser promovido para published sem revisão humana registrada.

commit;
