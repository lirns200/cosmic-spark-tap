import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, useState } from "react";
import Game from "./pages/Game";
import Bonuses from "./pages/Bonuses";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Withdraw from "./pages/Withdraw";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Game />} />
              <Route path="/bonuses" element={<Bonuses />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
