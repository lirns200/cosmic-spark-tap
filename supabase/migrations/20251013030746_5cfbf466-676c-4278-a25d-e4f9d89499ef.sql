-- Support fractional stars and purchase totals
ALTER TABLE public.profiles
  ALTER COLUMN stars TYPE numeric(20,10)
  USING stars::numeric(20,10);

ALTER TABLE public.shop_purchases
  ALTER COLUMN total_spent TYPE numeric(20,10)
  USING total_spent::numeric(20,10);

-- Fix ambiguous column reference in energy regeneration
CREATE OR REPLACE FUNCTION public.regenerate_energy(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_energy integer;
  v_max_energy integer;
  v_last_update timestamptz;
  energy_to_add integer;
BEGIN
  SELECT energy, max_energy, updated_at
    INTO v_current_energy, v_max_energy, v_last_update
  FROM public.profiles
  WHERE id = user_id;
  
  IF v_current_energy < v_max_energy THEN
    -- Regenerate 1 energy per second
    energy_to_add := LEAST(
      v_max_energy - v_current_energy,
      EXTRACT(EPOCH FROM (now() - v_last_update))::integer
    );
    
    UPDATE public.profiles
    SET energy = LEAST(energy + energy_to_add, v_max_energy),
        updated_at = now()
    WHERE id = user_id;
  END IF;
END;
$function$;