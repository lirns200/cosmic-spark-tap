import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Medal } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from("daily_leaderboard")
      .select(`
        *,
        profiles:user_id (telegram_username)
      `)
      .eq("date", today)
      .order("clicks_count", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error loading leaderboard:", error);
    } else {
      setLeaders(data || []);
    }
    setLoading(false);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const getReward = (index: number) => {
    if (index === 0) return 10000;
    if (index === 1) return 5000;
    if (index === 2) return 2500;
    return 0;
  };

  return (
    <div className="min-h-screen pb-20 p-4">
      <div className="text-center mb-6">
        <Trophy className="text-primary mx-auto mb-3" size={48} />
        <h1 className="text-3xl font-bold">Топ игроков</h1>
        <p className="text-muted-foreground mt-2">Ежедневное соревнование</p>
        <p className="text-sm text-primary mt-1">🏆 1 место: +10000 ⭐ | 2 место: +5000 ⭐ | 3 место: +2500 ⭐</p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Пока нет данных за сегодня
          </div>
        ) : (
          leaders.map((leader, index) => {
            const reward = getReward(index);
            return (
              <div
                key={leader.id}
                className={`bg-card border-2 rounded-2xl p-4 flex items-center gap-4 ${
                  index < 3 ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                }`}
              >
                <div className="text-3xl font-bold w-12 text-center">
                  {getMedalIcon(index)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {leader.profiles?.telegram_username || "Unknown"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Кликов:</span>
                    <span className="font-bold text-primary">{leader.clicks_count}</span>
                  </div>
                </div>

                {reward > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <Star size={18} className="fill-primary" />
                      <span>+{reward}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 p-4 bg-card border-2 border-border rounded-2xl max-w-2xl mx-auto">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Medal className="text-primary" size={20} />
          Правила
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Соревнование обновляется каждые 24 часа</li>
          <li>• Награды получают топ-3 игрока по кликам за день</li>
          <li>• Кликайте больше, чтобы попасть в топ!</li>
        </ul>
      </div>
    </div>
  );
}
