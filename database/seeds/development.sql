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
   'android', 'genérica', '0.1-demo', 'draft', 4),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001',
   'ios', 'genérica', '0.1-demo', 'draft', 4);

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
  (1::smallint, 'Abra o aplicativo',
   'Toque no aplicativo oficial do seu banco para abri-lo.',
   'Tela inicial fictícia de celular com um aplicativo genérico de banco destacado.',
   null::text, null::text),
  (2::smallint, 'Procure Pagamentos',
   'Na tela inicial do banco, procure uma opção com o texto Pagamentos.',
   'Tela bancária fictícia com a opção Pagamentos destacada.', null::text, null::text),
  (3::smallint, 'Escolha boleto',
   'Toque na opção relacionada a pagamento de boleto.',
   'Menu fictício de pagamentos com a opção Boleto destacada.', null::text, null::text),
  (4::smallint, 'Escolha como informar o código',
   'Escolha entre usar a câmera ou digitar o código. Não informe nenhum dado neste guia.',
   'Tela fictícia oferecendo leitura por câmera ou digitação, sem dados reais.',
   null::text, null::text),
  (5::smallint, 'Confira as informações',
   'Antes de continuar no banco, confira com calma todos os dados mostrados.',
   'Tela fictícia de conferência com campos genéricos e sem valores ou pessoas reais.',
   null::text, null::text),
  (6::smallint, 'Pare antes de confirmar',
   'O guia termina aqui. Volte ao aplicativo do banco somente se estiver seguro.',
   'Aviso de segurança indicando que o Guido não realiza nem confirma pagamentos.',
   'Confira cuidadosamente o nome de quem receberá, o valor e o vencimento. O Guido nunca pede sua senha e nunca confirma pagamentos por você.',
   'Demonstração concluída sem realizar qualquer operação bancária.')
) as content(position, title, instruction, image_alt, warning, confirmation_message)
where guide.tutorial_id = '30000000-0000-4000-8000-000000000001';

-- Este seed é somente para desenvolvimento local. O conteúdo permanece draft e não
-- deve ser promovido para published sem revisão humana registrada.

commit;
