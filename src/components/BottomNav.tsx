import { useNavigate, useLocation } from "react-router-dom";
import { Star, Trophy, ShoppingBag, Users, Wallet, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Используем функцию has_role для проверки
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: session.user.id,
      _role: 'admin'
    });

    if (!error && data === true) {
      setIsAdmin(true);
    }
  };

  const navItems = [
    { path: "/referrals", icon: Users, label: "Друзья" },
    { path: "/shop", icon: ShoppingBag, label: "Магазин" },
    { path: "/", icon: Star, label: "Играть", isMain: true },
    { path: "/leaderboard", icon: Trophy, label: "Топ" },
    { path: "/withdraw", icon: Wallet, label: "Вывод" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/98 to-background/95 border-t-2 border-primary/30 pb-safe z-50 backdrop-blur-xl shadow-2xl shadow-primary/10">
      <div className="flex items-end justify-between gap-1 px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-end justify-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1.5 mx-3 group"
                >
                  <div className={`bg-gradient-to-br from-primary via-primary to-primary/90 rounded-full p-4 -mb-3 border-4 border-background shadow-2xl transition-all duration-300 ${
                    isActive ? "shadow-primary/60 scale-110" : "shadow-primary/40 group-hover:shadow-primary/60 group-hover:scale-105"
                  }`}>
                    <Icon size={28} className="text-primary-foreground fill-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-extrabold text-primary whitespace-nowrap tracking-wide mt-1">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 flex-1 group ${
                  isActive 
                    ? "bg-primary/15 text-primary shadow-md shadow-primary/25 scale-105" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105"
                }`}
              >
                <Icon 
                  size={22} 
                  className={`transition-all duration-300 ${
                    isActive 
                      ? "fill-primary scale-110" 
                      : "group-hover:scale-110"
                  }`}
                  strokeWidth={2.5}
                />
                <span className={`text-[10px] font-bold whitespace-nowrap transition-all ${
                  isActive ? "text-primary" : "group-hover:text-primary"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 hover:bg-primary/15 hover:scale-105 ml-2 shadow-sm hover:shadow-md hover:shadow-primary/20"
          >
            <Shield size={22} className="text-primary transition-transform group-hover:scale-110" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-primary">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
}
