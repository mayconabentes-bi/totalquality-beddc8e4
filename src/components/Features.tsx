import { 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  Bell, 
  Lock,
  ClipboardCheck,
  Target
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Gestão de Documentos",
    description: "Controle versões, aprovações e distribuição de documentos com rastreabilidade completa."
  },
  {
    icon: BarChart3,
    title: "Indicadores (KPIs)",
    description: "Monitore indicadores de qualidade em tempo real com dashboards personalizáveis."
  },
  {
    icon: ClipboardCheck,
    title: "Auditorias Internas",
    description: "Planeje, execute e acompanhe auditorias com checklists automatizados."
  },
  {
    icon: Target,
    title: "Não Conformidades",
    description: "Registre e trate não conformidades com análise de causa raiz integrada."
  },
  {
    icon: Users,
    title: "Gestão de Pessoas",
    description: "Controle treinamentos, competências e avaliações de desempenho."
  },
  {
    icon: Settings,
    title: "Processos Mapeados",
    description: "Visualize e otimize seus processos com fluxogramas interativos."
  },
  {
    icon: Bell,
    title: "Alertas Automáticos",
    description: "Receba notificações sobre prazos, pendências e vencimentos."
  },
  {
    icon: Lock,
    title: "Segurança & Compliance",
    description: "Dados criptografados e controle de acesso por perfil de usuário."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Recursos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tudo que você precisa para
            <br />
            <span className="gradient-text">excelência em qualidade</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas completas para implementar e manter seu Sistema de Gestão da Qualidade.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <div 
    className="group p-6 rounded-2xl gradient-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-soft">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
      {title}
    </h3>
    <p className="text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

export default Features;
