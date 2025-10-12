import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Game from "./pages/Game";
import Bonuses from "./pages/Bonuses";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Withdraw from "./pages/Withdraw";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import LoadingScreen from "./components/LoadingScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<><Game /><BottomNav /></>} />
            <Route path="/bonuses" element={<><Bonuses /><BottomNav /></>} />
            <Route path="/shop" element={<><Shop /><BottomNav /></>} />
            <Route path="/leaderboard" element={<><Leaderboard /><BottomNav /></>} />
            <Route path="/withdraw" element={<><Withdraw /><BottomNav /></>} />
            <Route path="/admin" element={<><Admin /><BottomNav /></>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
