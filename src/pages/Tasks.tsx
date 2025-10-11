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
    <div className="min-h-screen pb-20 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Задания</h1>
      
      <div className="space-y-3 max-w-2xl mx-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card border-2 border-border rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                task.completed ? "bg-primary" : "bg-muted"
              }`}>
                {task.completed ? (
                  <Check className="text-primary-foreground" size={20} />
                ) : (
                  <Star className="text-muted-foreground" size={20} />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <div className="flex items-center gap-1 text-primary">
                  <Star size={16} className="fill-primary" />
                  <span className="font-bold">+{task.reward}</span>
                </div>
              </div>
            </div>
            
            {!task.completed && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Получить
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
