# Conceitos e responsabilidades

## Por que existem vários agentes

Separar os papéis evita que o mesmo agente pesquise, invente, aprove e publique
o próprio trabalho. Cada trabalhador entrega uma parte verificável.

| Agente | Faz | Não faz |
| --- | --- | --- |
| Orquestrador | cria a tarefa, chama os trabalhadores e reúne a entrega | pesquisa ou publica por conta própria |
| Pesquisa | localiza fontes oficiais e registra evidências | acessa conta ou considera fonte não oficial como verdade |
| Roteiro | transforma evidências em passos curtos | inventa telas ou confirma conteúdo sem fonte |
| Mídia | seleciona candidatos de imagem e registra direitos | baixa ou reutiliza vídeo/imagem sem autorização |
| Segurança | procura fraude, dados sensíveis e instruções perigosas | aprova conteúdo editorial |
| Revisão | compara todas as entregas e recomenda correções | muda o status para `published` |

## Quem continua responsável

Uma pessoa autorizada continua responsável por conferir fontes, testar o fluxo
no aplicativo correto, avaliar os direitos das imagens e publicar no Guido.
Automação é auxílio editorial, não substituição da responsabilidade humana.

## Estados permitidos

- `completed`: o agente concluiu sua parte;
- `needs_review`: há dúvida que exige uma pessoa;
- `blocked`: faltou fonte, permissão ou informação essencial.

Nenhum desses estados significa que um guia está publicado.
