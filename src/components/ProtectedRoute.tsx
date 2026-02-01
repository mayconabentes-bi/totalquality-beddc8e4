import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (
    | "auditor" 
    | "empresa" 
    | "total_quality_iso" 
    | "master"
    | "proprietario"
    | "secretaria"
    | "treinador"
    | "recepcionista"
    | "manutencao"
    | "estacionamento"
  )[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setHasSession(false);
            setAuthorized(false);
          }
        } else {
          if (isMounted) setHasSession(true);
          // Busca o profile apenas se houver restrição de role
          if (allowedRoles) {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("role, status_homologacao")
              .eq("user_id", session.user.id)
              .single();

            // Superuser logic: 'master' role bypasses all restrictions
            if (error || !profile) {
              toast.error("Acesso negado para esta modalidade.");
              if (isMounted) setAuthorized(false);
            } else if (profile.role === 'master') {
              // Master role has automatic access to any protected route
              if (isMounted) setAuthorized(true);
            } else if (!profile.status_homologacao) {
              // Check if user is approved/homologated
              toast.error("Acesso negado. Aguardando homologação do usuário.");
              if (isMounted) setAuthorized(false);
            } else if (!allowedRoles.includes(profile.role as any)) {
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
        // Only log in development to avoid exposing route protection logic
        if (import.meta.env.DEV) {
          console.error("Route verification error:", error);
        }
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
    // Se não tem sessão, redireciona para login
    if (!hasSession) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    // Se tem sessão mas não tem role adequada, redireciona para dashboard
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
