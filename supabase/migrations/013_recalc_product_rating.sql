-- Products are writable by admins only, so the review API could not update the
-- average rating. Recalculate through a SECURITY DEFINER function instead.
create or replace function public.recalc_product_rating(p_product_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products p
     set rating = coalesce(
       (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = p.id),
       0
     )
   where p.id = p_product_id;
$$;
revoke all on function public.recalc_product_rating(uuid) from public;
grant execute on function public.recalc_product_rating(uuid) to authenticated;
