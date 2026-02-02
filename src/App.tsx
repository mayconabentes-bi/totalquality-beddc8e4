import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Risks from "./pages/Risks";
import Maintenance from "./pages/Maintenance";
import NPS from "./pages/NPS";
import Secretaria from "./pages/Secretaria";
import Treinador from "./pages/Treinador";
import Parking from "./pages/Parking";
import NotFound from "./pages/NotFound";
import UpgradePlan from "./pages/UpgradePlan";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['master']}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auditoria" 
            element={
              <ProtectedRoute allowedRoles={['auditor', 'total_quality_iso']}>
                <div className="p-8">Painel de Auditoria ISO</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documentos" 
            element={
              <ProtectedRoute allowedRoles={['empresa', 'total_quality_iso']}>
                <div className="p-8">Documentos</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/riscos" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario']} requiredModule="gestao_riscos">
                <Risks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manutencao" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'manutencao']} requiredModule="manutencao">
                <Maintenance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nps" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'recepcionista']} requiredModule="nps">
                <NPS />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/secretaria" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'secretaria']}>
                <Secretaria />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/treinador" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'treinador']}>
                <Treinador />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/estacionamento" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'estacionamento']}>
                <Parking />
              </ProtectedRoute>
            } 
          />
          <Route path="/upgrade" element={<UpgradePlan />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
