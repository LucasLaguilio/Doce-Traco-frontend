# Dados de Teste do Stripe

Para testar os pagamentos, use os seguintes dados:

## Cartão de Sucesso
- Número: **4242 4242 4242 4242**
- Validade: **12/25** (ou qualquer data futura)
- CVC: **123** (ou qualquer 3 dígitos)
- Nome: Qualquer um

## Cartão que Rejeita (Sem Fundos)
- Número: **4000 0000 0000 0002**
- Validade: **12/25**
- CVC: **123**

## Cartão com Expiração Declinada
- Número: **4000 0000 0000 0069**
- Validade: **12/25**
- CVC: **123**

## Cartão com CVC Inválido
- Número: **4000 0000 0000 0127**
- Validade: **12/25**
- CVC: **123**

---

**Observações:**
- Use a data de expiração do cartão como qualquer mês/ano futuro (ex: 12/25, 06/26)
- O CVC pode ser qualquer número de 3-4 dígitos
- Para 3D Secure, use: **4000 0025 0000 3155**
- O pagamento será processado em tempo real através da API do Stripe

[Documentação Stripe de Teste](https://stripe.com/docs/testing)
