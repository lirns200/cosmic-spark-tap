import { Star, Check, Users, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Bonuses() {
  const [user, setUser] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralCount, setReferralCount] = useState<number>(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadReferralCode(session.user.id);
      await loadReferralCount(session.user.id);
    }
  };

  const loadReferralCode = async (userId: string) => {
    let { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data: newCode } = await supabase
        .from("referral_codes")
        .insert({ user_id: userId, code })
        .select("code")
        .single();
      
      setReferralCode(newCode?.code || "");
    } else {
      setReferralCode(data.code);
    }
  };

  const loadReferralCount = async (userId: string) => {
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId);
    
    setReferralCount(count || 0);
  };

  const copyReferralLink = () => {
    const link = `https://t.me/your_bot?start=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Реферальная ссылка скопирована!");
  };

  const tasks = [
    { id: 1, title: "Первый клик", reward: 0.001, completed: true },
    { id: 2, title: "Кликнуть 100 раз", reward: 0.05, completed: false },
    { id: 3, title: "Кликнуть 1000 раз", reward: 0.2, completed: false },
    { id: 4, title: "7 дней подряд", reward: 0.5, completed: false },
  ];

  return (
    <div className="min-h-screen pb-24 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Бонусы</h1>
      
      {/* Referral Section */}
      <div className="mb-6 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-primary" size={24} />
            <h2 className="text-lg font-bold">Пригласи друга</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Получай <span className="text-primary font-bold">0.1 ⭐</span> за каждого друга!
          </p>
          
          <div className="bg-card rounded-2xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Твой код:</span>
              <Button
                onClick={copyReferralLink}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
              >
                <Copy size={14} className="mr-1" />
                Копировать
              </Button>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary tracking-wider">{referralCode}</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-card rounded-2xl p-3">
            <span className="text-sm font-semibold">Приглашено друзей:</span>
            <span className="text-lg font-bold text-primary">{referralCount}</span>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-2.5 max-w-2xl mx-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card border-2 border-border rounded-2xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                task.completed ? "bg-primary" : "bg-muted"
              }`}>
                {task.completed ? (
                  <Check className="text-primary-foreground" size={18} />
                ) : (
                  <Star className="text-muted-foreground" size={18} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{task.title}</h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star size={14} className="fill-primary" />
                  <span className="font-bold text-xs">+{task.reward}</span>
                </div>
              </div>
            </div>
            
            {!task.completed && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2">
                Получить
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
