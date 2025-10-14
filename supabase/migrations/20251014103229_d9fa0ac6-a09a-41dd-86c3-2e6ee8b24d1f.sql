-- Обновляем функцию создания профиля для поддержки Telegram
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  telegram_username TEXT;
  is_admin BOOLEAN;
BEGIN
  -- Получаем username из метаданных Telegram
  telegram_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'Player' || substring(NEW.id::text from 1 for 8)
  );
  
  -- Создаем профиль
  INSERT INTO public.profiles (id, telegram_username)
  VALUES (NEW.id, telegram_username);
  
  -- Проверяем, является ли пользователь админом
  is_admin := (telegram_username = 'L1r_No');
  
  -- Создаем роль пользователя
  IF is_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;