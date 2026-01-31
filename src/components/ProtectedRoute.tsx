import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("auditor" | "empresa" | "total_quality_iso")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) setAuthorized(false);
        } else {
          // Busca o profile apenas se houver restrição de role
          if (allowedRoles) {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("user_id", session.user.id)
              .single();

            if (error || !profile || !allowedRoles.includes(profile.role as "auditor" | "empresa" | "total_quality_iso")) {
              toast.error("Acesso negado para esta modalidade.");
              if (isMounted) setAuthorized(false);
            } else {
              if (isMounted) setAuthorized(true);
            }
          } else {
            // Se não houver restrição de role, apenas a sessão basta
            if (isMounted) setAuthorized(true);
          }
        }
      } catch (error) {
        console.error("Erro na verificação de rota:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAccess();
    return () => { isMounted = false; };
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm font-display">
          Validando credenciais Axioma...
        </div>
      </div>
    );
  }

  if (!authorized) {
    // Redireciona para login e salva a página que o usuário tentou acessar
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
