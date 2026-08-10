# Pesquisa inicial de guias

Consulta realizada em **28 de julho de 2026**. Somente páginas públicas oficiais foram pesquisadas. Nenhuma conta autenticada, captura com dado pessoal, scraping ou tutorial de terceiros foi usado.

## Fontes consultadas

### CAIXA — pagar contas e boletos

- Aplicativo: CAIXA;
- tarefa: pagar conta ou boleto;
- sistema: Android e iOS, sem passos diferenciados na fonte;
- fonte oficial: [Página “Para Você” da CAIXA](https://www.caixa.gov.br/voce/paginas/default.aspx);
- encontrado: a instituição informa que o aplicativo permite pagar contas e boletos;
- não confirmado: caminho de menus, câmera/digitação, telas, versões, conferência e confirmação;
- status: **pendente de validação humana**.

### Itaú — pagamentos

- Aplicativo: Itaú;
- tarefa: pagar contas e boletos;
- sistema: não diferenciado na fonte;
- fonte oficial: [Página do App Itaú](https://www.itau.com.br/app-itau);
- encontrado: a área “Pagamentos” menciona contas e boletos;
- não confirmado: sequência, posição de controles, diferenças Android/iOS e versão do app;
- status: **pendente de validação humana**.

### Banco do Brasil — resultado insuficiente

- Aplicativo: Banco do Brasil;
- tarefa pesquisada: pagar boleto;
- sistema: não diferenciado;
- fonte oficial consultada: [BB Pay](https://www.bb.com.br/site/pra-voce/solucoes-digitais/bb-pay/);
- encontrado: o material trata principalmente de criar cobranças e receber via link, não do fluxo de pagar boleto pretendido;
- decisão: não aproveitar passos;
- status: **pendente de nova pesquisa e validação humana**.

## Conteúdo demonstrativo do MVP

Os seis passos existentes em `src/data/guides.ts` são uma hipótese genérica para testar a interface. Eles não foram extraídos das fontes acima, não representam banco específico, usam placeholders fictícios e têm status `draft`. O fluxo termina antes de confirmação.

O arquivo `public/guide-placeholders/banco-demonstracao-icon.png` foi gerado por IA em 9 de agosto de 2026 exclusivamente para identificar o aplicativo bancário fictício nos mockups. O símbolo é genérico, não foi obtido de terceiros, não representa instituição financeira real e não deve ser apresentado como marca oficial.

## Verificação manual pendente

Para cada item, a equipe deve verificar separadamente Android e iOS, registrar versão e data, produzir capturas autorizadas e anonimizadas e obter revisão de duas pessoas quando houver risco financeiro.

- WhatsApp: enviar áudio, fazer chamada e recuperar acesso;
- Gov.br: acessar conta e recuperar senha;
- CAIXA: pagar boleto;
- Banco do Brasil: pagar boleto;
- Itaú: pagar boleto;
- Bradesco: pagar boleto;
- Santander: pagar boleto;
- Nubank: pagar boleto.
- Banco Inter: Pix, boleto, comprovante, cartão, saldo e limite;
- PicPay: Pix, boleto, comprovante, cartão, saldo e limite;
- Mercado Pago: Pix, boleto, comprovante, cartão, saldo e limite;
- C6 Bank: Pix, boleto, comprovante, cartão, saldo e limite.

Os registros acima podem aparecer no catálogo como “em preparação”, mas isso não significa que seus passos tenham sido pesquisados ou aprovados.

Também falta confirmar fontes oficiais e autorização de uso para todos os logos. Até isso ocorrer, a interface usa placeholders textuais sem alterar ou reproduzir marcas.
