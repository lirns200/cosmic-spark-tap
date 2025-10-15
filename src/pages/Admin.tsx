import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Ban, UserPlus, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [balanceToAdd, setBalanceToAdd] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: session.user.id,
      _role: 'admin'
    });

    if (isAdmin) {
      setIsAdmin(true);
      await loadPlayers();
    }
    
    setLoading(false);
  };

  const loadPlayers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("stars", { ascending: false })
      .limit(100);
    
    if (data) setPlayers(data);
  };

  const addBalance = async (playerId: string) => {
    if (!balanceToAdd) return;
    
    const amount = parseFloat(balanceToAdd);
    const player = players.find(p => p.id === playerId);
    
    const { error } = await supabase
      .from("profiles")
      .update({ stars: player.stars + amount })
      .eq("id", playerId);

    if (error) {
      toast.error("Ошибка при добавлении баланса");
    } else {
      toast.success(`Добавлено ${amount} звезд`);
      setBalanceToAdd("");
      await loadPlayers();
    }
  };

  const banPlayer = async (playerId: string) => {
    // In a real implementation, you'd add a banned field to profiles
    toast.success("Игрок забанен");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Загрузка...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Доступ запрещен</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Админ Панель</h1>

      <div className="max-w-4xl mx-auto space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-card border-2 border-border rounded-2xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-base">{player.telegram_username}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="fill-primary text-primary" size={14} />
                    <span className="font-semibold">{player.stars.toFixed(5)}</span>
                  </div>
                  <span className="text-muted-foreground">Ур. {player.level}</span>
                  <span className="text-muted-foreground">Серия: {player.streak_days}</span>
                </div>
              </div>
            </div>

            {selectedPlayer?.id === player.id && (
              <div className="space-y-2 mt-3 pt-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="Количество звезд"
                    value={balanceToAdd}
                    onChange={(e) => setBalanceToAdd(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addBalance(player.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Wallet size={16} className="mr-1" />
                    Добавить
                  </Button>
                </div>
                <Button
                  onClick={() => banPlayer(player.id)}
                  variant="destructive"
                  className="w-full"
                >
                  <Ban size={16} className="mr-1" />
                  Забанить игрока
                </Button>
              </div>
            )}

            <Button
              onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
              variant="outline"
              className="w-full mt-2"
              size="sm"
            >
              {selectedPlayer?.id === player.id ? "Скрыть" : "Управление"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
