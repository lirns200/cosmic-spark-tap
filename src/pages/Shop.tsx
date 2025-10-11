import { Star, Zap, Battery } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Shop() {
  const items = [
    { id: 1, title: "Двойной клик", description: "+1 звезда за клик", cost: 1000, icon: Zap },
    { id: 2, title: "Энергия +100", description: "Максимум энергии +100", cost: 2000, icon: Battery },
    { id: 3, title: "Тройной клик", description: "+2 звезды за клик", cost: 5000, icon: Zap },
    { id: 4, title: "Энергия +500", description: "Максимум энергии +500", cost: 10000, icon: Battery },
  ];

  return (
    <div className="min-h-screen pb-24 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Магазин</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-card border-2 border-border rounded-2xl p-4"
            >
              <div className="flex items-start gap-2.5 mb-2.5">
                <div className="bg-primary/20 p-2.5 rounded-xl">
                  <Icon className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <Star className="fill-primary text-primary" size={16} />
                  <span className="font-bold text-base">{item.cost}</span>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2">
                  Купить
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
