import { Star, Zap, Battery } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Shop() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadProfile(session.user.id);
      await loadPurchases(session.user.id);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) setProfile(data);
  };

  const loadPurchases = async (userId: string) => {
    const { data } = await supabase
      .from("shop_purchases")
      .select("*")
      .eq("user_id", userId);
    
    if (data) setPurchases(data);
  };

  const getItemLevel = (itemId: string) => {
    const purchase = purchases.find(p => p.item_id === itemId);
    return purchase?.level || 0;
  };

  const getItemPrice = (basePrice: number, level: number) => {
    return basePrice * Math.pow(1.5, level);
  };

  const items = [
    { id: "double_click", title: "Двойной клик", description: "+0.00001 за клик", basePrice: 0.001, icon: Zap },
    { id: "energy_100", title: "Энергия +100", description: "Максимум энергии +100", basePrice: 0.002, icon: Battery },
    { id: "triple_click", title: "Тройной клик", description: "+0.00002 за клик", basePrice: 0.005, icon: Zap },
    { id: "energy_500", title: "Энергия +500", description: "Максимум энергии +500", basePrice: 0.01, icon: Battery },
  ];

  const buyItem = async (item: any) => {
    if (!user || !profile) return;
    
    const currentLevel = getItemLevel(item.id);
    const price = getItemPrice(item.basePrice, currentLevel);

    if (Number(profile.stars) < price) {
      toast.error("Недостаточно звезд!");
      return;
    }

    const purchase = purchases.find(p => p.item_id === item.id);
    
    try {
      if (purchase) {
        const { error } = await supabase
          .from("shop_purchases")
          .update({ 
            level: currentLevel + 1,
            total_spent: Number(purchase.total_spent || 0) + price
          })
          .eq("id", purchase.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("shop_purchases")
          .insert({
            user_id: user.id,
            item_id: item.id,
            level: 1,
            total_spent: price
          });
        
        if (error) throw error;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ stars: Number(profile.stars) - price })
        .eq("id", user.id);
      
      if (profileError) throw profileError;

      toast.success("Куплено!");
      await loadProfile(user.id);
      await loadPurchases(user.id);
    } catch (error) {
      console.error("Error buying item:", error);
      toast.error("Ошибка покупки");
    }
  };

  return (
    <div className="min-h-screen pb-24 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Магазин</h1>
      
      {profile && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2">
            <Star className="fill-primary text-primary" size={20} />
            <span className="font-bold text-lg">{Number(profile.stars).toFixed(4)}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const level = getItemLevel(item.id);
          const price = getItemPrice(item.basePrice, level);
          
          return (
            <div
              key={item.id}
              className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-2xl p-4 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-2.5 mb-2.5">
                <div className="bg-primary/20 p-2.5 rounded-xl">
                  <Icon className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{item.title}</h3>
                    {level > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                        Ур. {level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5">
                  <Star className="fill-primary text-primary" size={16} />
                  <span className="font-bold text-base">{Number(price).toFixed(4)}</span>
                </div>
                <Button 
                  onClick={() => buyItem(item)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2"
                >
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
