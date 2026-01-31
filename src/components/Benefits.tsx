import { Check } from "lucide-react";

const benefits = [
  "Reduza custos operacionais em até 30%",
  "Elimine retrabalho e desperdícios",
  "Automatize processos repetitivos",
  "Centralize toda documentação",
  "Prepare-se para certificações ISO",
  "Melhore a satisfação dos clientes",
  "Tome decisões baseadas em dados",
  "Aumente a produtividade da equipe"
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              Benefícios
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Transforme sua gestão
              <br />
              <span className="gradient-text">com resultados reais</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nossos clientes alcançam resultados expressivos em poucos meses de uso da plataforma.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-4 lg:space-y-6">
              <StatsCard value="30%" label="Redução de Custos" color="primary" />
              <StatsCard value="50%" label="Menos Retrabalho" color="accent" />
            </div>
            <div className="space-y-4 lg:space-y-6 pt-8">
              <StatsCard value="2x" label="Mais Produtividade" color="accent" />
              <StatsCard value="99%" label="Satisfação Garantida" color="primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatsCardProps {
  value: string;
  label: string;
  color: "primary" | "accent";
}

const StatsCard = ({ value, label, color }: StatsCardProps) => (
  <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border/50 shadow-medium hover:shadow-strong transition-shadow">
    <div className={`font-display text-4xl lg:text-5xl font-bold mb-2 ${color === 'primary' ? 'text-primary' : 'text-accent'}`}>
      {value}
    </div>
    <div className="text-muted-foreground font-medium">{label}</div>
  </div>
);

export default Benefits;
