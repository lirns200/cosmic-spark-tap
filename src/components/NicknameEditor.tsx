import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Flag } from "lucide-react";

interface NicknameEditorProps {
  userId: string;
  currentNickname: string;
  onUpdate: () => void;
}

export default function NicknameEditor({ userId, currentNickname, onUpdate }: NicknameEditorProps) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(currentNickname);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim() || nickname.length < 3) {
      toast.error("Никнейм должен быть минимум 3 символа");
      return;
    }

    if (nickname.length > 20) {
      toast.error("Никнейм не может быть длиннее 20 символов");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ telegram_username: nickname.trim() })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Никнейм обновлен!");
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error("Ошибка обновления никнейма");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setOpen(true)}>
        <Flag className="text-primary animate-pulse" size={18} />
        <span className="text-lg font-bold text-foreground">{currentNickname}</span>
        <Pencil 
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
          size={14} 
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Изменить никнейм</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Введите новый никнейм"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="text-center text-lg font-semibold"
            />
            <div className="text-center text-xs text-muted-foreground">
              Минимум 3 символа, максимум 20
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
