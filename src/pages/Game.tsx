import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Flame, Battery, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import ReferralDialog from "@/components/ReferralDialog";

export default function Game() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clicking, setClicking] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{ id: number; x: number; y: number; value: number }>>([]);
  const [showReferralDialog, setShowReferralDialog] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!profile) return;
    
    const interval = setInterval(() => {
      regenerateEnergy();
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Error signing in:", error);
        toast.error("Ошибка входа");
        return;
      }
      setUser(data.user);
      await loadProfile(data.user!.id);
    } else {
      setUser(session.user);
      await loadProfile(session.user.id);
    }
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      checkStreak(data);
    }
  };

  const checkStreak = async (profileData: any) => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = profileData.last_login_date;

    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastLogin === yesterdayStr && profileData.daily_clicks >= 100) {
        newStreak = (profileData.streak_days || 0) + 1;
      }

      const username = profileData.telegram_username === profileData.id.substring(0, 8) 
        ? `Player${Math.floor(Math.random() * 10000)}`
        : profileData.telegram_username;

      await supabase
        .from("profiles")
        .update({
          last_login_date: today,
          streak_days: newStreak,
          daily_clicks: 0,
          telegram_username: username
        })
        .eq("id", profileData.id);

      setProfile({ ...profileData, streak_days: newStreak, daily_clicks: 0, last_login_date: today, telegram_username: username });
    }
  };

  const regenerateEnergy = async () => {
    if (!profile || !user) return;

    const { data } = await supabase
      .rpc("regenerate_energy", { user_id: user.id });

    const { data: updated } = await supabase
      .from("profiles")
      .select("energy")
      .eq("id", user.id)
      .single();

    if (updated) {
      setProfile({ ...profile, energy: updated.energy });
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profile || !user) return;
    if (profile.energy <= 0) {
      toast.error("Нет энергии! Подождите восстановления");
      return;
    }

    setClicking(true);
    setTimeout(() => setClicking(false), 300);

    const x = e.clientX;
    const y = e.clientY;
    const clickValue = 0.0001;

    const id = Date.now();
    setFloatingNumbers([...floatingNumbers, { id, x, y, value: clickValue }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(num => num.id !== id));
    }, 1000);

    const currentStars = Number(profile.stars);
    const newStars = currentStars + clickValue;
    const newEnergy = Math.max(0, profile.energy - 1);
    const newDailyClicks = profile.daily_clicks + 1;
    const newTotalClicks = profile.total_clicks + 1;

    setProfile({
      ...profile,
      stars: newStars,
      energy: newEnergy,
      daily_clicks: newDailyClicks,
      total_clicks: newTotalClicks
    });

    const { error } = await supabase
      .from("profiles")
      .update({
        stars: newStars,
        energy: newEnergy,
        daily_clicks: newDailyClicks,
        total_clicks: newTotalClicks
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
    }

    await updateLeaderboard(newDailyClicks);
  };

  const updateLeaderboard = async (dailyClicks: number) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from("daily_leaderboard")
      .upsert({
        user_id: user.id,
        date: today,
        clicks_count: dailyClicks
      }, {
        onConflict: "user_id,date"
      });

    if (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (!profile) return null;

  const energyPercent = (profile.energy / profile.max_energy) * 100;

  return (
    <>
      {user && (
        <ReferralDialog 
          userId={user.id} 
          onComplete={() => {
            setShowReferralDialog(false);
            loadProfile(user.id);
          }} 
        />
      )}
      <div className="min-h-screen flex flex-col pb-24 px-4 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{profile.telegram_username}</span>
          <div className="bg-primary text-primary-foreground px-3 py-0.5 rounded-full font-bold flex items-center gap-1 text-sm">
            <span className="text-xs">👑</span>
            <span>Ур. {profile.level}</span>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="mb-3">
        <div className="bg-card border-2 border-border rounded-3xl p-2.5 flex items-center gap-2">
          <Flame className="text-secondary" size={18} />
          <span className="text-foreground font-semibold text-sm">
            {profile.streak_days} {profile.streak_days === 1 ? "день" : profile.streak_days < 5 ? "дня" : "дней"}
          </span>
        </div>
      </div>

      {/* Stars Counter */}
      <div className="mb-3">
        <div className="bg-primary rounded-3xl p-4 text-center">
      <div className="flex items-center justify-center gap-2">
            <Star className="fill-primary-foreground text-primary-foreground" size={24} />
            <span className="text-3xl font-bold text-primary-foreground">{profile.stars.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Energy */}
      <div className="mb-3">
        <div className="bg-card border-2 border-border rounded-3xl p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Battery className="text-primary" size={16} />
              <span className="text-foreground font-semibold text-sm">
                Энергия: {profile.energy}/{profile.max_energy}
              </span>
            </div>
            {profile.energy < profile.max_energy && (
              <span className="text-xs text-muted-foreground">
                {Math.ceil((profile.max_energy - profile.energy) / 60)} мин
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-3">
        <div className="bg-card border-2 border-border rounded-3xl p-2.5 flex items-center gap-2">
          <TrendingUp className="text-primary" size={16} />
          <span className="text-foreground font-semibold text-sm">Уровень {profile.level} прогресс</span>
        </div>
      </div>

      {/* Clickable Star */}
      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        <div
          onClick={handleClick}
          className={`cursor-pointer select-none ${clicking ? "click-animation" : ""}`}
        >
          <Star 
            size={140} 
            className="star-glow pulse-glow fill-primary text-primary"
            strokeWidth={3}
          />
        </div>

        {/* Floating numbers */}
        {floatingNumbers.map((num) => (
          <div
            key={num.id}
            className="fixed text-primary font-bold text-xl pointer-events-none z-50"
            style={{
              left: num.x,
              top: num.y,
              animation: "floatUp 1s ease-out forwards"
            }}
          >
            +{num.value}
          </div>
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-card border-2 border-border rounded-2xl p-2 text-center">
          <div className="text-primary font-bold text-xs">⚡ +0.0001/клик</div>
        </div>
        <div className="flex-1 bg-card border-2 border-border rounded-2xl p-2 text-center">
          <div className="text-primary font-bold text-xs">📈 {profile.daily_clicks}</div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px);
          }
        }
      `}</style>
      </div>
    </>
  );
}
