import { Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Tasks() {
  const tasks = [
    { id: 1, title: "Первый клик", reward: 100, completed: true },
    { id: 2, title: "Кликнуть 100 раз", reward: 500, completed: false },
    { id: 3, title: "Кликнуть 1000 раз", reward: 2000, completed: false },
    { id: 4, title: "7 дней подряд", reward: 5000, completed: false },
  ];

  return (
    <div className="min-h-screen pb-24 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Задания</h1>
      
      <div className="space-y-2.5 max-w-2xl mx-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card border-2 border-border rounded-2xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                task.completed ? "bg-primary" : "bg-muted"
              }`}>
                {task.completed ? (
                  <Check className="text-primary-foreground" size={18} />
                ) : (
                  <Star className="text-muted-foreground" size={18} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{task.title}</h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star size={14} className="fill-primary" />
                  <span className="font-bold text-xs">+{task.reward}</span>
                </div>
              </div>
            </div>
            
            {!task.completed && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2">
                Получить
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
