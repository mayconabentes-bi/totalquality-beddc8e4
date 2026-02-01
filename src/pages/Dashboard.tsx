import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  LogOut, 
  Building2, 
  FileText, 
  BarChart3, 
  ClipboardCheck,
  Users,
  Settings,
  Bell,
  Plus,
  TrendingUp,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  industry: string | null;
  size: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  company_id: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        // Defer data fetching
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Fetch company if profile has company_id
        if (profileData.company_id) {
          const { data: companyData } = await supabase
            .from("companies")
            .select("*")
            .eq("id", profileData.company_id)
            .single();

          if (companyData) {
            setCompany(companyData);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-soft">
                <CheckCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Total<span className="gradient-text">Quality</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Olá, {profile?.full_name || "Usuário"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de gestão da qualidade da{" "}
            <span className="font-semibold text-foreground">{company?.name || "sua empresa"}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={FileText} 
            value="0" 
            label="Documentos Ativos" 
            trend="+0%"
            color="primary"
          />
          <StatCard 
            icon={AlertTriangle} 
            value="0" 
            label="Não Conformidades" 
            trend="0 abertas"
            color="accent"
          />
          <StatCard 
            icon={ClipboardCheck} 
            value="0" 
            label="Auditorias" 
            trend="0 pendentes"
            color="primary"
          />
          <StatCard 
            icon={TrendingUp} 
            value="0%" 
            label="Meta de Qualidade" 
            trend="Definir meta"
            color="accent"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickActionCard icon={FileText} label="Novo Documento" />
            <QuickActionCard icon={AlertTriangle} label="Registrar NC" />
            <QuickActionCard icon={ClipboardCheck} label="Nova Auditoria" />
            <QuickActionCard icon={Users} label="Treinamento" />
            <QuickActionCard icon={BarChart3} label="Indicadores" />
            <QuickActionCard icon={Calendar} label="Agenda" />
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Documentos - Hidden for 'auditor' role */}
            {profile?.role !== 'auditor' && (
              <ModuleCard 
                icon={FileText}
                title="Documentos"
                description="Gerencie documentos, versões e aprovações"
                items={["0 documentos", "0 pendentes"]}
              />
            )}
            <ModuleCard 
              icon={AlertTriangle}
              title="Não Conformidades"
              description="Registre e trate não conformidades"
              items={["0 abertas", "0 em tratamento"]}
            />
            {/* Auditorias - Hidden for 'empresa' role */}
            {profile?.role !== 'empresa' && (
              <ModuleCard 
                icon={ClipboardCheck}
                title="Auditorias"
                description="Planeje e execute auditorias internas"
                items={["0 programadas", "0 realizadas"]}
              />
            )}
            <ModuleCard 
              icon={BarChart3}
              title="Indicadores"
              description="Monitore KPIs e metas de qualidade"
              items={["0 indicadores", "0 alertas"]}
            />
            <ModuleCard 
              icon={Users}
              title="Treinamentos"
              description="Gerencie competências e capacitações"
              items={["0 treinamentos", "0 vencendo"]}
            />
            {/* Configurações - Hidden for 'empresa' role */}
            {profile?.role !== 'empresa' && (
              <ModuleCard 
                icon={Building2}
                title="Configurações"
                description="Configure sua empresa e usuários"
                items={["Perfil", "Usuários"]}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  trend: string;
  color: "primary" | "accent";
}

const StatCard = ({ icon: Icon, value, label, trend, color }: StatCardProps) => (
  <div className="bg-card rounded-xl border border-border/50 p-5 shadow-soft">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color === 'primary' ? 'text-primary' : 'text-accent'}`} />
      </div>
      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{trend}</span>
    </div>
    <div className="mt-4">
      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  </div>
);

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const QuickActionCard = ({ icon: Icon, label }: QuickActionCardProps) => (
  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all group">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <span className="text-sm font-medium text-foreground">{label}</span>
  </button>
);

interface ModuleCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  items: string[];
}

const ModuleCard = ({ icon: Icon, title, description, items }: ModuleCardProps) => (
  <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover:shadow-medium transition-all group cursor-pointer">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="flex gap-2">
      {items.map((item, index) => (
        <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default Dashboard;
