begin;

-- Roteiros editoriais compartilhados usam o próprio guide_slug. Itens de
-- catálogo específicos de cada banco continuam apontando para esse contexto,
-- mas não disputam o vínculo porque ainda não têm versão publicável.
update public.tutorials tutorial
set image_context_slug = tutorial.slug
where exists (
  select 1
  from public.guide_versions guide
  where guide.tutorial_id = tutorial.id
    and guide.public_for_upload = true
);

-- Os arquivos permanecem no mesmo bucket e com as mesmas chaves. Apenas as
-- referências opcionais ao roteiro e ao passo estruturado são recalculadas.
update public.guide_public_images image
set guide_version_id = linked.guide_version_id,
    guide_step_id = linked.guide_step_id
from (
  select image_row.id as image_id,
         guide.id as guide_version_id,
         step.id as guide_step_id,
         row_number() over (
           partition by image_row.id
           order by (guide.status = 'published') desc, guide.updated_at desc
         ) as preference
  from public.guide_public_images image_row
  join public.tutorials tutorial
    on tutorial.image_context_slug = image_row.guide_slug
  join public.guide_versions guide
    on guide.tutorial_id = tutorial.id
   and guide.platform = image_row.operating_system
   and (guide.public_for_upload = true or guide.status = 'published')
  join public.steps step
    on step.guide_version_id = guide.id
   and step.position = image_row.step_order
) linked
where image.id = linked.image_id
  and linked.preference = 1;

commit;
