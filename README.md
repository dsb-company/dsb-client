# DSB Client

Portal do Cliente da DSB Company, integrado ao mesmo Supabase do DSB Manager.

## O que já está pronto

- Login por e-mail e senha usando Supabase Auth.
- Sem cadastro público: somente clientes autorizados entram.
- Dashboard do cliente com indicadores de chamados.
- Lista de chamados, busca e filtro por status.
- Criação de novos chamados.
- Numeração compartilhada com o Manager (`DSB-00001`, `DSB-00002`...).
- Conversa cliente ↔ equipe DSB.
- Anexos privados: PNG, JPG, WEBP, PDF e TXT, até 10 MB por arquivo.
- Recuperação de senha.
- Alteração de senha dentro da conta.
- Layout responsivo para desktop e celular.
- RLS: o cliente só acessa os chamados da empresa à qual foi vinculado.

## 1. Ativar o portal no Supabase

O DSB Manager e `supabase/chamados.sql` precisam já estar instalados.

No Supabase, abra **SQL Editor** e execute somente:

`supabase/portal-setup.sql`

Esse arquivo adiciona duas funções seguras para o portal. Ele não libera a tabela `dsb_records` para clientes e não altera os módulos existentes do Manager.

## 2. Criar o primeiro acesso de cliente

### A. Criar o usuário

No Supabase:

**Authentication → Users → Add user**

Crie o e-mail e a senha inicial do responsável do cliente.

### B. Descobrir o UUID da empresa

No SQL Editor:

```sql
select id, data->>'name' as empresa
from public.dsb_records
where type='client'
order by data->>'name';
```

Copie o `id` da empresa desejada.

### C. Vincular o login à empresa

Substitua os três valores do exemplo abaixo:

```sql
insert into public.dsb_customer_users(user_id,client_id,name,email)
select
  id,
  'UUID_DO_CLIENTE'::uuid,
  'Nome do responsável',
  lower(email)
from auth.users
where lower(email)=lower('cliente@empresa.com');
```

Depois disso, esse login passa a enxergar somente os chamados daquela empresa.

## 3. Configuração pública

O arquivo `supabase/config.js` já foi configurado com a mesma Project URL e chave **publishable** do DSB Manager fornecido para esta integração.

É seguro manter a Project URL e a chave publishable/anon no frontend. Nunca coloque `service_role`, `sb_secret_`, senha do banco ou senha pessoal no projeto.

## 4. Rodar localmente

Não abra apenas clicando duas vezes no `index.html`. Use um servidor local.

No VS Code, a extensão **Live Server** funciona normalmente. Depois abra o endereço fornecido pelo Live Server.

## 5. Recuperação de senha

Para que links de recuperação funcionem quando o portal estiver publicado, no Supabase configure:

**Authentication → URL Configuration**

Adicione o endereço publicado do DSB Client em **Redirect URLs**.

Exemplo conceitual:

`https://cliente.seudominio.com/**`

Durante testes locais, adicione também o endereço usado pelo Live Server.

## Fluxo

Cliente abre ou responde no DSB Client → dados são salvos nas mesmas tabelas `dsb_tickets`, `dsb_ticket_messages` e `dsb_ticket_attachments` → aparecem no DSB Manager.

Resposta da equipe no DSB Manager → aparece no mesmo chamado do DSB Client.


## Correção de senha (30/09/2026)
O formulário Minha conta > Atualizar senha agora valida a sessão, aguarda a confirmação do Supabase e encerra a sessão após a troca. Se a operação funcionar, o usuário volta ao login e deve entrar com a nova senha.

## Realtime, notificações e foto de perfil

Execute **uma vez** no mesmo projeto Supabase usado pelo Manager:

`supabase/realtime-perfis.sql`

> Se você já executou o arquivo que veio no DSB Manager, não execute novamente; é o mesmo upgrade de banco.

Com esse upgrade, o DSB Client passa a ter:
- mensagens e alterações do chamado em tempo real;
- rolagem automática para a mensagem mais recente;
- indicador **Nova mensagem** e contador de não lidas;
- marcação de leitura ao abrir o chamado;
- data/hora das mensagens atualizada sem recarregar;
- som opcional quando a DSB responde e o chamado não está aberto;
- notificações do Windows/navegador, ativadas pelo próprio usuário;
- foto de perfil com recorte, arraste e zoom em **Minha conta**.

As notificações desta versão dependem do DSB Client estar aberto ou em execução em segundo plano no navegador/PWA. Push com o portal totalmente fechado pode ser implementado depois com Web Push.
