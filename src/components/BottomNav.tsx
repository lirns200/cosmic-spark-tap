import { useNavigate, useLocation } from "react-router-dom";
import { Star, Trophy, ShoppingBag, ClipboardList, Wallet } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/tasks", icon: ClipboardList, label: "Задания" },
    { path: "/shop", icon: ShoppingBag, label: "Магазин" },
    { path: "/", icon: Star, label: "Играть", isMain: true },
    { path: "/leaderboard", icon: Trophy, label: "Топ" },
    { path: "/withdraw", icon: Wallet, label: "Вывод" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border px-2 py-3 z-50">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 relative"
              >
                <div className="bg-primary rounded-full p-4 -mt-8 border-4 border-background star-glow">
                  <Icon size={28} className="text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-primary">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={24} className={isActive ? "fill-primary" : ""} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
