import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface PromoCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export default function PromoCodeDialog({ open, onOpenChange, userId, onSuccess }: PromoCodeDialogProps) {
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!promoCode.trim()) {
      toast.error("Введите промокод");
      return;
    }

    setLoading(true);
    try {
      // Here you would validate the promo code and apply rewards
      // For now, let's create a simple example
      
      // Example promo codes
      const promoCodes: Record<string, number> = {
        "STAR100": 100,
        "WELCOME": 50,
        "BONUS25": 25,
        "MEGA": 200,
      };

      const reward = promoCodes[promoCode.toUpperCase()];
      
      if (!reward) {
        toast.error("Неверный промокод");
        setLoading(false);
        return;
      }

      // Award stars
      const { data: profile } = await supabase
        .from("profiles")
        .select("stars")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ stars: Number(profile.stars) + reward })
          .eq("id", userId);

        toast.success(`Получено ${reward} звезд! 🌟`);
        setPromoCode("");
        onOpenChange(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast.error("Ошибка применения промокода");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-primary/30 to-primary/10 p-4 rounded-full animate-pulse">
              <Sparkles className="text-primary" size={40} />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Секретный промокод</DialogTitle>
          <DialogDescription className="text-center">
            Введите промокод и получите <span className="text-primary font-bold">бонусные звезды</span>!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Введите промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            maxLength={20}
            className="text-center text-lg tracking-wider font-bold uppercase"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-lg py-6"
          >
            {loading ? "Проверка..." : "Активировать"}
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Секретная комбинация разблокирована! 🎉
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
