import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section id="contact" className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-4xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 gradient-bg rounded-3xl opacity-5" />
          <div className="absolute -inset-0.5 gradient-bg rounded-3xl opacity-20 blur-xl" />
          
          <div className="relative bg-card rounded-3xl p-8 lg:p-16 border border-border/50 shadow-strong text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Comece gratuitamente</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Pronto para elevar a
              <br />
              <span className="gradient-text">qualidade do seu negócio?</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Junte-se a mais de 500 empresas que já transformaram sua gestão da qualidade. 
              Experimente grátis por 14 dias, sem compromisso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="gradient-bg font-semibold shadow-medium hover:shadow-strong transition-all px-10 h-14 text-base group"
                onClick={() => navigate("/auth")}
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="font-semibold h-14 px-8 text-base border-2">
                Falar com Especialista
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              ✓ Sem cartão de crédito &nbsp; ✓ Setup em 5 minutos &nbsp; ✓ Suporte incluído
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
