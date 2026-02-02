import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Lock } from "lucide-react";

const UpgradePlan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border/50 rounded-lg p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Módulo Não Contratado
            </h1>
            <p className="text-muted-foreground">
              Este módulo não está incluído no seu plano atual. Entre em contato com o administrador para fazer upgrade.
            </p>
          </div>

          {/* Features */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm">Acesso completo aos módulos premium</span>
            </div>
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm">Suporte técnico prioritário</span>
            </div>
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm">Relatórios e análises avançadas</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
              variant="default"
            >
              Voltar ao Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/configuracoes")} 
              className="w-full gap-2"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir para Configurações
            </Button>
          </div>

          {/* Contact Info */}
          <p className="text-xs text-muted-foreground">
            Dúvidas? Entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;
