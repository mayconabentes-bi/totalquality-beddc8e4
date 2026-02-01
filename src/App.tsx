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
import NotFound from "./pages/NotFound";
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
              <ProtectedRoute allowedRoles={['master', 'proprietario']}>
                <Risks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manutencao" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'manutencao']}>
                <Maintenance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nps" 
            element={
              <ProtectedRoute allowedRoles={['master', 'proprietario', 'recepcionista']}>
                <NPS />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
