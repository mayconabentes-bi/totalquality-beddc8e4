import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ArrowLeft, Construction } from "lucide-react";

const Maintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Manutenção de Ativos
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="w-6 h-6 text-primary" />
              Módulo em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              O módulo de Manutenção de Ativos está em desenvolvimento. 
              As tabelas do banco de dados precisam ser criadas para habilitar esta funcionalidade.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Maintenance;
