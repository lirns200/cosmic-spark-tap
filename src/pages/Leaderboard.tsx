import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Medal, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    loadSquads();
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

  const loadSquads = async () => {
    const { data } = await supabase
      .from("squads")
      .select("*")
      .order("total_clicks", { ascending: false })
      .limit(10);
    
    if (data) {
      setSquads(data);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const getReward = (index: number) => {
    if (index === 0) return 10;
    if (index === 1) return 5;
    if (index === 2) return 2.5;
    return 0;
  };

  return (
    <div className="min-h-screen pb-24 p-4">
      <div className="text-center mb-4">
        <Trophy className="text-primary mx-auto mb-2" size={40} />
        <h1 className="text-2xl font-bold">Топ</h1>
      </div>

      <Tabs defaultValue="players" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="players">Игроки</TabsTrigger>
          <TabsTrigger value="squads">Squads</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-2.5">
          <div className="text-center mb-3">
            <p className="text-muted-foreground text-sm">Ежедневное соревнование</p>
            <p className="text-xs text-primary mt-1">🏆 1: +10 ⭐ | 2: +5 ⭐ | 3: +2.5 ⭐</p>
          </div>

          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Пока нет данных за сегодня
            </div>
          ) : (
            leaders.map((leader, index) => {
              const reward = getReward(index);
              return (
                <div
                  key={leader.id}
                  className={`bg-card border-2 rounded-2xl p-3 flex items-center gap-3 ${
                    index < 3 ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                  }`}
                >
                  <div className="text-2xl font-bold w-10 text-center">
                    {getMedalIcon(index)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-base">
                      {leader.profiles?.telegram_username || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Кликов:</span>
                      <span className="font-bold text-primary">{leader.clicks_count}</span>
                    </div>
                  </div>

                  {reward > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary font-bold text-sm">
                        <Star size={14} className="fill-primary" />
                        <span>+{reward}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div className="mt-6 p-3 bg-card border-2 border-border rounded-2xl">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
              <Medal className="text-primary" size={16} />
              Правила
            </h3>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Соревнование обновляется каждые 24 часа</li>
              <li>• Награды получают топ-3 игрока по кликам за день</li>
              <li>• Кликайте больше, чтобы попасть в топ!</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="squads" className="space-y-2.5">
          <div className="text-center mb-3">
            <p className="text-muted-foreground text-sm">Рейтинг групп</p>
          </div>

          {squads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Пока нет групп
            </div>
          ) : (
            squads.map((squad, index) => (
              <div
                key={squad.id}
                className={`bg-card border-2 rounded-2xl p-3 flex items-center gap-3 ${
                  index < 3 ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                }`}
              >
                <div className="text-2xl font-bold w-10 text-center">
                  {getMedalIcon(index)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-base">{squad.name}</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{squad.member_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-primary text-primary" />
                      <span className="font-bold text-primary">{squad.total_clicks}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="mt-6 p-3 bg-card border-2 border-border rounded-2xl">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
              <Users className="text-primary" size={16} />
              Что такое Squads?
            </h3>
            <p className="text-xs text-muted-foreground">
              Добавьте бота в вашу группу или канал Telegram, чтобы создать Squad. 
              Клики всех участников группы суммируются в общий рейтинг!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
