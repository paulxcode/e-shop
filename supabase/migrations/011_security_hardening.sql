-- Role escalation guard: a user may never grant themselves admin.
CREATE OR REPLACE FUNCTION public.guard_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'customer' AND NOT public.is_admin() THEN
      NEW.role := 'customer';
    END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Nu poti modifica rolul contului';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_guard_role ON public.users;
CREATE TRIGGER users_guard_role
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_role();

-- Account deletion (A15): the user must be able to delete their own profile.
DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (id = auth.uid());

-- Terms acceptance at signup (A2).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- Abusive analytics payloads (B14): keep rows small and typed.
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_event_type_len CHECK (char_length(event_type) BETWEEN 1 AND 50),
  ADD CONSTRAINT analytics_page_url_len CHECK (page_url IS NULL OR char_length(page_url) <= 500),
  ADD CONSTRAINT analytics_event_data_size CHECK (pg_column_size(event_data) <= 2048);
