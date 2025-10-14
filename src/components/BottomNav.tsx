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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border pb-safe z-50">
      <div className="flex items-end justify-between gap-1 px-2 py-2 max-w-2xl mx-auto">
        <div className="flex items-end justify-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 mx-1"
                >
                  <div className="bg-primary rounded-full p-2.5 -mb-1 border-4 border-background star-glow shadow-lg">
                    <Icon size={22} className="text-primary-foreground fill-primary-foreground" />
                  </div>
                  <span className="text-[9px] font-medium text-primary whitespace-nowrap">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors flex-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={18} className={isActive ? "fill-primary" : ""} />
                <span className="text-[9px] font-medium whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors hover:bg-primary/10"
          >
            <Shield size={18} className="text-primary" />
            <span className="text-[9px] font-medium text-primary">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
}
