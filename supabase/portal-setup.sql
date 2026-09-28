-- DSB CLIENT · COMPLEMENTO DO PORTAL · 28/09/2026
-- Execute UMA VEZ no mesmo Supabase do DSB Manager.
-- Pré-requisito: schema.sql do Manager + chamados.sql já executados.
-- Este arquivo NÃO abre dsb_records para clientes. Ele expõe apenas os dados
-- mínimos da própria empresa por meio de uma função SECURITY DEFINER.

begin;

create or replace function public.dsb_customer_portal_profile()
returns table(
  user_id uuid,
  client_id uuid,
  name text,
  email text,
  company_name text,
  company_status text
)
language sql
stable
security definer
set search_path=''
as $$
  select
    cu.user_id,
    cu.client_id,
    cu.name,
    cu.email,
    coalesce(r.data->>'name','Cliente DSB') as company_name,
    coalesce(r.data->>'status','') as company_status
  from public.dsb_customer_users cu
  join public.dsb_records r on r.id=cu.client_id and r.type='client'
  where cu.user_id=(select auth.uid())
    and cu.active=true
  limit 1;
$$;

revoke all on function public.dsb_customer_portal_profile() from public,anon;
grant execute on function public.dsb_customer_portal_profile() to authenticated;

-- Cria chamado + primeira mensagem em uma única transação.
-- O client_id, nome e e-mail são sempre obtidos do vínculo autenticado no banco.
create or replace function public.dsb_customer_create_ticket(
  p_subject text,
  p_category text,
  p_priority text,
  p_page_url text,
  p_description text
)
returns table(ticket_id uuid,ticket_number bigint,message_id uuid)
language plpgsql
security definer
set search_path=''
as $$
declare
  customer public.dsb_customer_users%rowtype;
  new_ticket public.dsb_tickets%rowtype;
  new_message public.dsb_ticket_messages%rowtype;
begin
  select * into customer
  from public.dsb_customer_users
  where user_id=(select auth.uid()) and active=true;

  if customer.user_id is null then
    raise exception 'Usuário sem empresa autorizada';
  end if;
  if char_length(trim(coalesce(p_subject,''))) not between 3 and 180 then
    raise exception 'Assunto inválido';
  end if;
  if char_length(trim(coalesce(p_description,''))) not between 3 and 5000 then
    raise exception 'Descrição inválida';
  end if;
  if nullif(trim(coalesce(p_page_url,'')),'') is not null
     and trim(p_page_url) !~* '^https?://' then
    raise exception 'Página relacionada inválida';
  end if;

  insert into public.dsb_tickets(client_id,subject,category,priority,page_url)
  values(
    customer.client_id,
    trim(p_subject),
    p_category,
    p_priority,
    nullif(trim(coalesce(p_page_url,'')),'')
  )
  returning * into new_ticket;

  insert into public.dsb_ticket_messages(ticket_id,body)
  values(new_ticket.id,trim(p_description))
  returning * into new_message;

  return query select new_ticket.id,new_ticket.ticket_number,new_message.id;
end;
$$;

revoke all on function public.dsb_customer_create_ticket(text,text,text,text,text) from public,anon;
grant execute on function public.dsb_customer_create_ticket(text,text,text,text,text) to authenticated;

commit;

-- COMO VINCULAR UM CLIENTE (exemplo para o administrador no SQL Editor):
-- 1) Veja os clientes cadastrados no Manager:
-- select id, data->>'name' as empresa from public.dsb_records where type='client' order by data->>'name';
--
-- 2) Crie o usuário em Authentication > Users > Add user.
--
-- 3) Vincule o usuário à empresa substituindo os valores abaixo:
-- insert into public.dsb_customer_users(user_id,client_id,name,email)
-- select id,
--        'UUID_DO_CLIENTE'::uuid,
--        'Nome do responsável',
--        lower(email)
-- from auth.users
-- where lower(email)=lower('cliente@empresa.com');
