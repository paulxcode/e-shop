-- Coupons are readable only by admins (RLS), so customer checkout could never
-- read them. Lookups now go through SECURITY DEFINER functions that expose one
-- coupon at a time, matched case-insensitively (no LIKE wildcards).
create or replace function public.get_coupon(p_code text default null, p_id text default null)
returns setof public.coupons
language sql
security definer
set search_path = public
stable
as $$
  select * from public.coupons
  where (p_code is not null and lower(code) = lower(p_code))
     or (p_id is not null and id::text = p_id)
  limit 1;
$$;
revoke all on function public.get_coupon(text, text) from public;
grant execute on function public.get_coupon(text, text) to anon, authenticated;

-- Atomic counter bump; returns false when the coupon is no longer usable.
create or replace function public.use_coupon(p_coupon_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
begin
  update public.coupons
     set used_count = coalesce(used_count, 0) + 1
   where id::text = p_coupon_id
     and active
     and (expires_at is null or expires_at > now())
     and (max_uses is null or coalesce(used_count, 0) < max_uses);
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;
revoke all on function public.use_coupon(text) from public;
grant execute on function public.use_coupon(text) to authenticated;

-- A public SELECT policy on shared_wishlists exposed every token and user id,
-- while user_favorites RLS hid the items from visitors (so shared lists were
-- empty anyway). One function returns exactly the items for one token.
create or replace function public.get_shared_wishlist(p_token text)
returns table (
  user_name text,
  product_id uuid,
  name text,
  slug text,
  price numeric,
  compare_price numeric,
  images text[],
  rating numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select u.full_name, p.id, p.name, p.slug, p.price, p.compare_price, p.images, p.rating
  from public.shared_wishlists sw
  join public.users u on u.id = sw.user_id
  left join public.user_favorites f on f.user_id = sw.user_id
  left join public.products p on p.id = f.product_id
  where sw.token::text = p_token
  order by f.created_at desc nulls last
  limit 200;
$$;
revoke all on function public.get_shared_wishlist(text) from public;
grant execute on function public.get_shared_wishlist(text) to anon, authenticated;

drop policy if exists "shared_wishlists_select_public" on public.shared_wishlists;

create unique index if not exists shared_wishlists_user_id_key on public.shared_wishlists(user_id);
