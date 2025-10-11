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
    <div className="min-h-screen pb-20 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Магазин</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-card border-2 border-border rounded-2xl p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Icon className="text-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Star className="fill-primary text-primary" size={20} />
                  <span className="font-bold text-lg">{item.cost}</span>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
