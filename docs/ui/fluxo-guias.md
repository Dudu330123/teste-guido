# Fluxo de guias do Guido

Esta referência protege a hierarquia visual e os cuidados de segurança do fluxo usado por pessoas idosas ou com pouca familiaridade digital.

## Ordem de leitura

1. Contexto do guia e progresso atual.
2. Uma única instrução por vez.
3. Imagem do celular sem corte ou deformação.
4. Controles de áudio, retorno e avanço.
5. Ajuda e alertas de segurança sem linguagem de conclusão indevida.

## Matriz responsiva

| Faixa | Composição | Resultado obrigatório |
| --- | --- | --- |
| 1280 px ou mais | telefone e cartão lado a lado | ações sempre visíveis no cartão |
| 768–1279 px | uma coluna, instrução antes do telefone | largura máxima de leitura de 680 px |
| até 767 px | barra, trilha, instrução, telefone e ações em pilha | nenhum controle menor que 48 px |

## Prints usados como evidência

- Tamanho recomendado: **837 × 1880 pixels**, vertical e sem moldura adicionada.
- Outras resoluções verticais originais do celular continuam válidas.
- Formatos aceitos: PNG, JPEG e WebP, até 10 MB e no máximo 8192 × 8192 pixels.
- A imagem deve usar `object-fit: contain` e preservar sua proporção original.
- Não recortar, esticar, adicionar marca d’água ou exibir dados pessoais, bancários, valores, códigos ou boletos reais.
- Overlay de toque somente em evidência marcada como `VERIFIED`.

## Tokens e interação

- Ritmo principal: 16, 24 e 32 px.
- Alvos de toque: mínimo de 48 px; ações principais do leitor usam 56 px ou mais.
- Azul intenso fica reservado para etapa atual e ação principal.
- Concluído, atual e próximo devem ser diferenciados por forma, preenchimento e texto acessível, não somente por cor.
- Foco sempre visível; o fluxo inteiro funciona por teclado.
- Com redução de movimento, deslocamentos e animações são removidos.

## Checklist antes de publicar um guia

- [ ] Cada passo contém uma única ação verificável.
- [ ] A instrução não inventa telas ou resultados ainda não validados.
- [ ] O print não possui dados reais e mantém a proporção original.
- [ ] O alerta de segurança aparece antes de qualquer ação sensível.
- [ ] Guias parciais terminam em “Próxima etapa em preparação”, sem aparência de conclusão.
- [ ] Desktop, tablet, celular, teclado e redução de movimento foram revisados.
