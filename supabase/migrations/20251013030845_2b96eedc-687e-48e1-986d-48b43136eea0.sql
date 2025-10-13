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
  SELECT p.energy, p.max_energy, p.updated_at
    INTO v_current_energy, v_max_energy, v_last_update
  FROM public.profiles p
  WHERE p.id = user_id;
  
  IF v_current_energy IS NULL THEN
    RETURN;
  END IF;

  IF v_current_energy < v_max_energy THEN
    energy_to_add := LEAST(
      v_max_energy - v_current_energy,
      EXTRACT(EPOCH FROM (now() - v_last_update))::integer
    );
    
    UPDATE public.profiles AS p
    SET energy = LEAST(p.energy + energy_to_add, v_max_energy),
        updated_at = now()
    WHERE p.id = user_id;
  END IF;
END;
$function$;