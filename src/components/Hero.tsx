import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 gradient-hero overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Sistema de Gestão da Qualidade</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Eleve a{" "}
            <span className="gradient-text">qualidade</span>
            <br />
            do seu negócio
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Gerencie processos, monitore indicadores e garanta a conformidade com as normas ISO de forma simples e eficiente.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              className="gradient-bg font-semibold shadow-medium hover:shadow-strong transition-all px-8 h-14 text-base group"
              onClick={() => navigate("/auth")}
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="font-semibold h-14 px-8 text-base group border-2">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver Demonstração
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <StatCard icon={Shield} value="+500" label="Empresas Certificadas" />
            <StatCard icon={TrendingUp} value="98%" label="Taxa de Aprovação" />
            <StatCard icon={Award} value="ISO 9001" label="Conformidade Total" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-soft">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div className="text-left">
      <div className="font-display font-bold text-2xl text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  </div>
);

export default Hero;
