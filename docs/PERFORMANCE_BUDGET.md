# Orçamento de performance mobile

O orçamento automatizado roda com:

```bash
npm run perf:budget
```

Limites atuais:

- até 40 MB para todas as telas locais dos guias;
- nenhuma tela de guia em PNG;
- até 3 MB para os assets críticos da home;
- carregamento prioritário somente da tela atual do guia;
- pré-carregamento em baixa prioridade apenas da próxima tela.

Para uma verificação manual em 4G, usar uma build de produção (`npm run build && npm run start`) e o Chrome DevTools com `Moto G4`, CPU `4x slowdown` e rede `Slow 4G`. Na aba Network, a home deve carregar somente os assets críticos e, ao abrir um guia, uma nova tela deve ser requisitada por avanço. O Lighthouse deve ser acompanhado pelos indicadores LCP, INP, CLS e TTFB, com meta de LCP abaixo de 2,5 s em uma conexão 4G regular.
