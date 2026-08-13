# Requisitos funcionais e não funcionais

## Escopo da primeira integração vertical

- disponibilizar health e readiness;
- listar e consultar aplicativos;
- listar tutoriais de um aplicativo;
- obter guia completo por tutorial/plataforma ou ID;
- pesquisar tutoriais com limites explícitos;
- manter a demonstração de boleto identificada como fictícia e não validada;
- permitir que o frontend use a API sem perder o fallback local durante a transição.

## Regras permanentes

- somente `published` pode ser conteúdo público real;
- `draft` demonstrativo pode aparecer apenas quando `is_demo=true` e o ambiente autorizar demonstrações;
- publicação financeira exige revisão humana e registro de auditoria;
- guias terminam antes de senha, autenticação ou confirmação irreversível;
- nenhum dado bancário, CPF, boleto pessoal, senha ou token completo pode ser persistido ou logado;
- Android e iOS são variantes explícitas;
- imagens ficam no Object Storage; o banco guarda metadados e chaves.

## Limites iniciais

- paginação: 1 a 50 itens;
- pesquisa: até 120 caracteres;
- passo: posição de 1 a 500;
- imagem/áudio: até 10 MiB no modelo inicial;
- formatos iniciais: AVIF, WebP, PNG e MP3;
- timeout do frontend ao consultar a API: 2 segundos durante a transição.

## Fora do escopo atual

Pagamento, OCR, automação dentro de aplicativos, scraping autenticado, mensagens, assinatura, anúncios, IA de publicação, microsserviços, Redis, filas e offline completo.

