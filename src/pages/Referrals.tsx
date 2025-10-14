import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Copy, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Referrals() {
  const [user, setUser] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadReferralCode(session.user.id);
      await loadReferrals(session.user.id);
    }
    setLoading(false);
  };

  const loadReferralCode = async (userId: string) => {
    const { data } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .single();

    if (data) {
      setReferralCode(data.code);
    } else {
      // Создаем код если его нет
      await createReferralCode(userId);
    }
  };

  const createReferralCode = async (userId: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
      .from("referral_codes")
      .insert({ user_id: userId, code });

    if (!error) {
      setReferralCode(code);
    }
  };

  const loadReferrals = async (userId: string) => {
    const { data } = await supabase
      .from("referrals")
      .select(`
        *,
        profiles:referred_id (
          telegram_username,
          stars,
          streak_days
        )
      `)
      .eq("referrer_id", userId)
      .neq("referred_id", userId); // Исключаем "пропустили" записи

    if (data) {
      setReferrals(data);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Код скопирован!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-4">
      <div className="text-center mb-4">
        <Users className="text-primary mx-auto mb-2" size={40} />
        <h1 className="text-2xl font-bold">Реферальная система</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Реферальный код */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary rounded-3xl p-4">
          <h2 className="text-center font-bold mb-2">Ваш реферальный код</h2>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="text-center text-xl font-bold tracking-wider"
            />
            <Button onClick={copyCode} size="icon">
              <Copy size={20} />
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Приглашайте друзей и получайте по 5 ⭐ за каждого!
          </p>
        </div>

        {/* Статистика */}
        <div className="bg-card border-2 border-border rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Всего приглашено</p>
              <p className="text-2xl font-bold text-primary">{referrals.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Заработано</p>
              <div className="flex items-center gap-1">
                <Star className="fill-primary text-primary" size={20} />
                <p className="text-2xl font-bold">{referrals.length * 5}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Список приглашенных */}
        <div>
          <h2 className="font-bold mb-3 text-lg">Ваши друзья ({referrals.length})</h2>
          
          {referrals.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl p-6 text-center text-muted-foreground">
              Вы еще никого не пригласили
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((referral, index) => (
                <div
                  key={referral.id}
                  className="bg-card border-2 border-border rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold">
                      {referral.profiles?.telegram_username || "Игрок"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Flame size={12} className="text-secondary" />
                        <span>{referral.profiles?.streak_days || 0} дн.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-primary text-primary" />
                        <span>{Number(referral.profiles?.stars || 0).toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-primary/10 px-2 py-1 rounded-lg">
                      <span className="text-primary font-bold text-xs">+5 ⭐</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Как это работает */}
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <h3 className="font-bold mb-2 text-sm">Как это работает?</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Поделитесь своим кодом с друзьями</li>
            <li>• Когда друг использует ваш код, вы оба получаете 5 ⭐</li>
            <li>• Приглашайте больше друзей и зарабатывайте больше звезд!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
