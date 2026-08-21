# Publicação do billing soberano

Este arquivo registra a publicação da configuração de billing da Plataforma de Inteligência Soberana. Os Price IDs e a chave secreta são fornecidos pelo ambiente de produção do Vercel; nenhum segredo é armazenado no repositório.

O Checkout de planos e pacotes de créditos deve ser validado em produção sem concluir pagamentos durante os testes.

## Regra operacional

O Stripe permanece como fonte de verdade para pagamentos e assinaturas. O NowGo permanece como fonte de verdade para créditos, uso e entitlements reconciliados por webhook idempotente.

## Estado da publicação

A atualização de ambiente de produção foi feita no Vercel e este marcador força uma nova compilação para que os valores corrigidos sejam aplicados ao deployment de produção.

> Não executar cobranças reais durante a validação.

