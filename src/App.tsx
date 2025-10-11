import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./pages/Game";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Withdraw from "./pages/Withdraw";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Game /><BottomNav /></>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/tasks" element={<><Tasks /><BottomNav /></>} />
          <Route path="/shop" element={<><Shop /><BottomNav /></>} />
          <Route path="/leaderboard" element={<><Leaderboard /><BottomNav /></>} />
          <Route path="/withdraw" element={<><Withdraw /><BottomNav /></>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
