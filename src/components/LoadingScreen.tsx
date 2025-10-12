import { Star } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Star 
          size={80} 
          className="fill-primary text-primary animate-spin mx-auto mb-4"
          strokeWidth={2}
        />
        <p className="text-xl font-bold text-foreground">Загрузка...</p>
      </div>
    </div>
  );
}
