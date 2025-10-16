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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t-2 border-primary/20 pb-safe z-50 backdrop-blur-md">
      <div className="flex items-end justify-between gap-0.5 px-3 py-2.5 max-w-2xl mx-auto">
        <div className="flex items-end justify-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 mx-2 group"
                >
                  <div className="bg-primary rounded-full p-3.5 -mb-2 border-4 border-background shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-primary-foreground fill-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-bold text-primary whitespace-nowrap tracking-wide">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all flex-1 group ${
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-all ${
                    isActive 
                      ? "fill-primary scale-110" 
                      : "group-hover:scale-105"
                  }`} 
                />
                <span className={`text-[10px] font-semibold whitespace-nowrap ${
                  isActive ? "" : "group-hover:text-foreground"
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
            className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all hover:bg-primary/10 ml-1"
          >
            <Shield size={20} className="text-primary" />
            <span className="text-[10px] font-semibold text-primary">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
}
