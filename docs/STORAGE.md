# Storage independente

Runtime usa adaptador local em `src/lib/storage`. Objetos ficam fora de `public/`, em `LOCAL_STORAGE_DIR`, e são servidos por URLs assinadas da rota `/api/storage`.

Buckets lógicos preservados:

- `guide-public`: imagens públicas de demonstração;
- `guide-media`: mídia privada de guias;
- `guide-drafts`: rascunhos privados.

O banco guarda bucket, chave, MIME, tamanho e dimensões. O adaptador pode ser substituído por S3/R2/B2/MinIO sem alterar as entidades de catálogo.

Nenhum objeto do Supabase antigo é acessado ou apagado. Migração futura deve exportar objetos e metadados, mapear chaves, validar checksums e trocar URLs somente após backup.
