// Telegram Web App SDK helper
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window === 'undefined') return null;
  
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;
  
  const user = tg.initDataUnsafe?.user;
  if (!user) return null;
  
  return user;
};

export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
};

export const initTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    window.Telegram?.WebApp.ready();
    window.Telegram?.WebApp.expand();
  }
};
