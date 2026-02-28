import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DateProvider } from "@/contexts/DateContext";
import Index from "./pages/Index";
import Extrato from "./pages/Extrato";
import Graficos from "./pages/Graficos";
import Categorias from "./pages/Categorias";
import Importar from "./pages/Importar";
import Investimentos from "./pages/Investimentos";
import Dividas from "./pages/Dividas";
import MinhaCarteira from "./pages/MinhaCarteira";
import Cartoes from "./pages/Cartoes";
import TestSupabase from "./pages/TestSupabase";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/extrato" element={<Extrato />} />
            <Route path="/graficos" element={<Graficos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/importar" element={<Importar />} />
            <Route path="/investimentos" element={<Investimentos />} />
            <Route path="/dividas" element={<Dividas />} />
            <Route path="/carteira" element={<MinhaCarteira />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/test-supabase" element={<TestSupabase />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DateProvider>
  </QueryClientProvider>
);

export default App;
