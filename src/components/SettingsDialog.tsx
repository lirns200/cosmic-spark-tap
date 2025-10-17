import { useState } from "react";
import { Settings, Moon, Sun, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsDialog() {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "dark"
  );
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("language") || "ru"
  );

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem("theme", value);
    document.documentElement.classList.toggle("dark", value === "dark");
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10"
        >
          <Settings className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Настройки</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="theme" className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              Тема
            </Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Темная</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Язык
            </Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
