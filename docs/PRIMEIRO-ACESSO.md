# Primeiro acesso de cliente

Use este checklist para cada novo cliente que receber acesso ao portal.

1. Confirme que a empresa já existe em **Clientes** no DSB Manager.
2. Crie o usuário em **Supabase → Authentication → Users**.
3. Consulte o UUID da empresa em `dsb_records`.
4. Insira o vínculo em `dsb_customer_users`.
5. Envie ao cliente o endereço do DSB Client, o e-mail de acesso e a senha inicial por um canal adequado.
6. Peça para o cliente trocar a senha em **Minha conta** no primeiro acesso.
7. Faça um chamado de teste e confirme que ele aparece no DSB Manager.

## Observação de segurança

Nunca crie uma chave `service_role` dentro do DSB Client. Toda autorização do cliente é feita pelo Supabase Auth + RLS já configurado no banco.
