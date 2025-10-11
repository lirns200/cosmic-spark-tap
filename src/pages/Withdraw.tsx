import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Withdraw() {
  const [profile, setProfile] = useState<any>(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseInt(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    if (withdrawAmount > profile?.stars) {
      toast.error("Недостаточно звезд");
      return;
    }

    toast.success("Функция вывода в разработке!");
  };

  return (
    <div className="min-h-screen pb-24 p-4">
      <div className="text-center mb-4">
        <Wallet className="text-primary mx-auto mb-2" size={40} />
        <h1 className="text-2xl font-bold">Вывод</h1>
        <p className="text-muted-foreground text-sm mt-1">Обменяйте звезды на награды</p>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary rounded-3xl p-5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Star className="fill-primary text-primary" size={28} />
            <span className="text-3xl font-bold">{profile?.stars || 0}</span>
          </div>
          <p className="text-center text-xs text-muted-foreground">Доступно для вывода</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-card border-2 border-border rounded-2xl p-3 text-center">
            <TrendingUp className="text-primary mx-auto mb-1.5" size={20} />
            <p className="text-xl font-bold">{profile?.total_clicks || 0}</p>
            <p className="text-[10px] text-muted-foreground">Всего кликов</p>
          </div>
          <div className="bg-card border-2 border-border rounded-2xl p-3 text-center">
            <Star className="text-primary mx-auto mb-1.5" size={20} />
            <p className="text-xl font-bold">{profile?.level || 1}</p>
            <p className="text-[10px] text-muted-foreground">Уровень</p>
          </div>
        </div>

        {/* Withdraw Form */}
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <h3 className="font-bold mb-3 text-sm">Заявка на вывод</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">Сумма звезд</label>
              <Input
                type="number"
                placeholder="Введите количество"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background border-border h-10 text-sm"
              />
            </div>

            <Button 
              onClick={handleWithdraw}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-5"
            >
              Вывести
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card border-2 border-border rounded-2xl p-3">
          <h3 className="font-bold mb-1.5 text-sm">ℹ️ Информация</h3>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>• Минимальная сумма вывода: 10,000 звезд</li>
            <li>• Обработка заявки: 1-3 дня</li>
            <li>• Функция вывода скоро будет доступна</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
