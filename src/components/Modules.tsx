import { Button } from "@/components/ui/button";
import { ArrowRight, FileCheck, BarChart2, Users2, AlertTriangle, BookOpen, Workflow } from "lucide-react";

const modules = [
  {
    icon: FileCheck,
    title: "Documentos",
    description: "Controle completo de documentos, versões e aprovações com fluxos automatizados.",
    features: ["Controle de versões", "Aprovações digitais", "Distribuição automática"]
  },
  {
    icon: BarChart2,
    title: "Indicadores",
    description: "Dashboards em tempo real para monitorar KPIs e metas de qualidade.",
    features: ["Gráficos interativos", "Metas personalizadas", "Relatórios automáticos"]
  },
  {
    icon: AlertTriangle,
    title: "Não Conformidades",
    description: "Registro e tratamento de NC com análise de causa raiz e planos de ação.",
    features: ["Análise 5 Porquês", "Planos de ação", "Follow-up automático"]
  },
  {
    icon: Users2,
    title: "Auditorias",
    description: "Planejamento e execução de auditorias internas com checklists personalizáveis.",
    features: ["Checklists dinâmicos", "Relatórios PDF", "Acompanhamento de evidências"]
  },
  {
    icon: BookOpen,
    title: "Treinamentos",
    description: "Gestão de competências, treinamentos e avaliações da equipe.",
    features: ["Matriz de competências", "Certificados digitais", "Avaliações online"]
  },
  {
    icon: Workflow,
    title: "Processos",
    description: "Mapeamento e visualização de processos com fluxogramas interativos.",
    features: ["Fluxogramas visuais", "SIPOC integrado", "Indicadores de processo"]
  }
];

const Modules = () => {
  return (
    <section id="modules" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Módulos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Uma plataforma completa
            <br />
            <span className="gradient-text">para sua empresa</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Módulos integrados que cobrem todas as necessidades do seu SGQ.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <ModuleCard key={module.title} {...module} delay={index * 0.1} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="gradient-bg font-semibold shadow-medium hover:shadow-strong transition-all px-8 h-14 text-base group">
            Ver Todos os Módulos
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

interface ModuleCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  delay: number;
}

const ModuleCard = ({ icon: Icon, title, description, features, delay }: ModuleCardProps) => (
  <div 
    className="group p-6 lg:p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-strong transition-all duration-300 hover:-translate-y-2"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-medium">
      <Icon className="w-7 h-7 text-primary-foreground" />
    </div>
    
    <h3 className="font-display font-bold text-xl text-foreground mb-3">
      {title}
    </h3>
    
    <p className="text-muted-foreground mb-6 leading-relaxed">
      {description}
    </p>

    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

export default Modules;
