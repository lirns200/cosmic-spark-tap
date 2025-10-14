// Telegram Web App utilities
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
          };
        };
        ready: () => void;
        expand: () => void;
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
}

export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window === 'undefined') return null;
  
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  return tg.initDataUnsafe.user || null;
};

export const initTelegramWebApp = () => {
  if (typeof window === 'undefined') return;
  
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }
};
