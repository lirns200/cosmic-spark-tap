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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border pb-safe z-50">
      <div className="flex items-end justify-center gap-1 px-2 py-2 max-w-2xl mx-auto">
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
    </nav>
  );
}
