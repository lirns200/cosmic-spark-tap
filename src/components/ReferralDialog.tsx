import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift } from "lucide-react";

interface ReferralDialogProps {
  userId: string;
  onComplete: () => void;
}

export default function ReferralDialog({ userId, onComplete }: ReferralDialogProps) {
  const [open, setOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfNewUser();
  }, [userId]);

  const checkIfNewUser = async () => {
    // Check if user has already entered a referral code or skipped
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_id", userId)
      .single();

    // Check if user already has a profile entry (not first time)
    const { data: profile } = await supabase
      .from("profiles")
      .select("created_at")
      .eq("id", userId)
      .single();

    if (!existingReferral && profile) {
      // Check if profile was just created (within last 10 seconds)
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
      
      if (diffInSeconds < 10) {
        setOpen(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!referralCode.trim()) {
      toast.error("Введите реферальный код");
      return;
    }

    setLoading(true);
    try {
      // Find the referrer by code
      const { data: referrerData, error: codeError } = await supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", referralCode.toUpperCase())
        .single();

      if (codeError || !referrerData) {
        toast.error("Неверный реферальный код");
        setLoading(false);
        return;
      }

      if (referrerData.user_id === userId) {
        toast.error("Нельзя использовать свой код");
        setLoading(false);
        return;
      }

      // Create referral record
      const { error: referralError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: referrerData.user_id,
          referred_id: userId,
          reward_claimed: false
        });

      if (referralError) {
        toast.error("Ошибка при использовании кода");
        setLoading(false);
        return;
      }

      // Award 5 stars to both users
      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("stars")
        .eq("id", referrerData.user_id)
        .single();

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("stars")
        .eq("id", userId)
        .single();

      // Update referrer stars
      await supabase
        .from("profiles")
        .update({ stars: Number(referrerProfile?.stars || 0) + 5 })
        .eq("id", referrerData.user_id);

      // Update current user stars
      await supabase
        .from("profiles")
        .update({ stars: Number(userProfile?.stars || 0) + 5 })
        .eq("id", userId);

      toast.success("Получено 5 звезд! Ваш друг тоже получил 5 звезд!");
      setOpen(false);
      onComplete();
    } catch (error) {
      console.error("Error submitting referral code:", error);
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Create a dummy referral record to mark as "skipped"
    await supabase
      .from("referrals")
      .insert({
        referrer_id: userId, // Use own ID to mark as skipped
        referred_id: userId,
        reward_claimed: true
      });
    
    setOpen(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/20 p-4 rounded-full">
              <Gift className="text-primary" size={40} />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Добро пожаловать!</DialogTitle>
          <DialogDescription className="text-center">
            Введите реферальный код друга и получите <span className="text-primary font-bold">5 звезд</span>!
            <br />
            <span className="text-xs text-muted-foreground">Ваш друг тоже получит 5 звезд</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Введите код"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            maxLength={10}
            className="text-center text-lg tracking-wider font-semibold"
          />
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Проверка..." : "Применить код"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="w-full"
            >
              Пропустить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
