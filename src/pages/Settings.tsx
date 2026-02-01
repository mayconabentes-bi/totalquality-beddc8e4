import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  LogOut, 
  ArrowLeft,
  Settings2,
  Brain,
  LineChart,
  UserPlus,
  Users as UsersIcon
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  market_intelligence: unknown;
  statistical_studies: unknown;
}

interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  company_id: string | null;
}

interface MarketIntelligence {
  cnae_principal?: string;
  setor_atuacao?: string;
  geolocalizacao?: string;
  densidade_demografica_local?: string;
  indice_concorrencia?: number;
}

interface StatisticalStudies {
  churn_rate?: number;
  margin_per_student?: number;
  clv?: number;
  cac?: number;
  ebitda_projetado?: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Form state for Market Intelligence
  const [cnaePrincipal, setCnaePrincipal] = useState("");
  const [setorAtuacao, setSetorAtuacao] = useState("");
  const [geolocalizacao, setGeolocalizacao] = useState("");
  const [densidadeDemografica, setDensidadeDemografica] = useState("");
  const [indiceConcorrencia, setIndiceConcorrencia] = useState("");
  
  // Form state for Statistical Studies
  const [churnRate, setChurnRate] = useState("");
  const [marginPerStudent, setMarginPerStudent] = useState("");
  const [clv, setClv] = useState("");
  const [cac, setCac] = useState("");
  const [ebitdaProjetado, setEbitdaProjetado] = useState("");

  // User management state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: ""
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchUserData(session.user.id);
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
          
          // Fetch team members for master and proprietario roles
          if (profileData.role === 'master' || profileData.role === 'proprietario') {
            const { data: teamData } = await supabase
              .from("profiles")
              .select("*")
              .eq("company_id", profileData.company_id)
              .order("full_name");

            if (teamData) {
              setTeamMembers(teamData);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (!profile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("full_name");

      if (!error && data) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.full_name || !newUserForm.role) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    if (!profile?.company_id) {
      toast.error("Empresa não identificada");
      return;
    }

    try {
      // Note: In production, user creation requires a Supabase Edge Function or Admin API
      // This is because client-side code cannot securely create users with email/password
      // 
      // To implement this:
      // 1. Create a Supabase Edge Function that uses the Admin API
      // 2. The function should:
      //    - Create the user with supabase.auth.admin.createUser()
      //    - Create the profile entry with the company_id and role
      //    - Send a password reset email or set a temporary password
      // 3. Call that edge function from here instead of showing this message
      
      toast.warning("Funcionalidade de criação de usuário requer implementação server-side", {
        duration: 5000
      });
      toast.info("Para criar usuários, utilize o painel de administração do Supabase ou implemente uma Edge Function", {
        duration: 5000
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Erro ao criar usuário");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const hasData = (jsonData: unknown): boolean => {
    if (!jsonData) return false;
    if (typeof jsonData === 'object' && Object.keys(jsonData).length === 0) return false;
    return true;
  };

  const openEditDialog = () => {
    if (!company) return;
    
    // Load market intelligence data
    const mi = company.market_intelligence as MarketIntelligence | null;
    setCnaePrincipal(mi?.cnae_principal || "");
    setSetorAtuacao(mi?.setor_atuacao || "");
    setGeolocalizacao(mi?.geolocalizacao || "");
    setDensidadeDemografica(mi?.densidade_demografica_local || "");
    setIndiceConcorrencia(mi?.indice_concorrencia?.toString() || "");
    
    // Load statistical studies data
    const ss = company.statistical_studies as StatisticalStudies | null;
    setChurnRate(ss?.churn_rate?.toString() || "");
    setMarginPerStudent(ss?.margin_per_student?.toString() || "");
    setClv(ss?.clv?.toString() || "");
    setCac(ss?.cac?.toString() || "");
    setEbitdaProjetado(ss?.ebitda_projetado?.toString() || "");
    
    setEditDialogOpen(true);
  };

  const handleSaveData = async () => {
    if (!company) return;

    try {
      // Helper function to parse and validate numeric values
      const parseNumericValue = (value: string): number | undefined => {
        if (!value || value.trim() === "") return undefined;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
      };

      // Prepare market intelligence object
      const marketIntelligence: MarketIntelligence = {
        cnae_principal: cnaePrincipal,
        setor_atuacao: setorAtuacao,
        geolocalizacao: geolocalizacao,
        densidade_demografica_local: densidadeDemografica,
        indice_concorrencia: parseNumericValue(indiceConcorrencia),
      };

      // Prepare statistical studies object - convert strings to numbers
      const statisticalStudies: StatisticalStudies = {
        churn_rate: parseNumericValue(churnRate),
        margin_per_student: parseNumericValue(marginPerStudent),
        clv: parseNumericValue(clv),
        cac: parseNumericValue(cac),
        ebitda_projetado: parseNumericValue(ebitdaProjetado),
      };

      // Update company in database
      const { error } = await supabase
        .from("companies")
        .update({
          market_intelligence: marketIntelligence,
          statistical_studies: statisticalStudies,
        })
        .eq("id", company.id);

      if (error) {
        toast.error("Erro ao salvar dados");
        console.error("Error updating company:", error);
      } else {
        toast.success("Dados salvos com sucesso!");
        setEditDialogOpen(false);
        // Refresh company data
        if (user) {
          fetchUserData(user.id);
        }
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Erro ao processar dados");
    }
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
              <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Configurações da Empresa
          </h1>
          <p className="text-muted-foreground">
            Gerencie os dados de Inteligência de Mercado e Estudos Estatísticos
          </p>
        </div>

        {/* Company Info Card */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                {company?.name || "Empresa"}
              </h2>
              <p className="text-muted-foreground">
                CNPJ: {company?.cnpj || "—"}
              </p>
            </div>
            <Button onClick={openEditDialog} className="gap-2">
              <Settings2 className="w-4 h-4" />
              Editar Dados Axioma
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Brain 
                className={`w-8 h-8 ${
                  hasData(company?.market_intelligence)
                    ? "text-primary"
                    : "text-muted-foreground/30"
                }`}
              />
              <div>
                <p className="font-medium text-foreground">Inteligência de Mercado</p>
                <p className="text-sm text-muted-foreground">
                  {hasData(company?.market_intelligence) ? "Configurado" : "Não configurado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <LineChart 
                className={`w-8 h-8 ${
                  hasData(company?.statistical_studies)
                    ? "text-accent"
                    : "text-muted-foreground/30"
                }`}
              />
              <div>
                <p className="font-medium text-foreground">Estudos Estatísticos</p>
                <p className="text-sm text-muted-foreground">
                  {hasData(company?.statistical_studies) ? "Configurado" : "Não configurado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section - Only for master and proprietario */}
        {(profile?.role === 'master' || profile?.role === 'proprietario') && (
          <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Gestão de Equipe
                </h2>
                <p className="text-muted-foreground">
                  Gerencie os membros da sua equipe e suas permissões
                </p>
              </div>
              <Button onClick={() => setUserDialogOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </div>

            {/* Team Members List */}
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{member.full_name || "Sem nome"}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role || "Sem role"} • ID: {member.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    member.role === 'master' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'proprietario' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'secretaria' ? 'bg-green-100 text-green-800' :
                    member.role === 'treinador' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum membro da equipe encontrado
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Dados Axioma</DialogTitle>
              <DialogDescription>
                Edite os dados de Inteligência de Mercado e Estudos Estatísticos para {company?.name}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="intelligence" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="intelligence">Inteligência</TabsTrigger>
                <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="intelligence" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnae_principal">CNAE Principal</Label>
                  <Input
                    id="cnae_principal"
                    value={cnaePrincipal}
                    onChange={(e) => setCnaePrincipal(e.target.value)}
                    placeholder="Ex: 8531-7/00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor_atuacao">Setor de Atuação</Label>
                  <Input
                    id="setor_atuacao"
                    value={setorAtuacao}
                    onChange={(e) => setSetorAtuacao(e.target.value)}
                    placeholder="Ex: Educação"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geolocalizacao">Geolocalização</Label>
                  <Input
                    id="geolocalizacao"
                    value={geolocalizacao}
                    onChange={(e) => setGeolocalizacao(e.target.value)}
                    placeholder="Ex: -23.5505,-46.6333 (lat,long)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="densidade_demografica">Densidade Demográfica Local</Label>
                  <Select value={densidadeDemografica} onValueChange={setDensidadeDemografica}>
                    <SelectTrigger id="densidade_demografica">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indice_concorrencia">Índice de Concorrência (0-1)</Label>
                  <Input
                    id="indice_concorrencia"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={indiceConcorrencia}
                    onChange={(e) => setIndiceConcorrencia(e.target.value)}
                    placeholder="Ex: 0.75"
                  />
                </div>
              </TabsContent>

              <TabsContent value="statistics" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="churn_rate">Churn Rate (%)</Label>
                  <Input
                    id="churn_rate"
                    type="number"
                    step="0.01"
                    value={churnRate}
                    onChange={(e) => setChurnRate(e.target.value)}
                    placeholder="Ex: 5.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin_per_student">Margem por Aluno (R$)</Label>
                  <Input
                    id="margin_per_student"
                    type="number"
                    step="0.01"
                    value={marginPerStudent}
                    onChange={(e) => setMarginPerStudent(e.target.value)}
                    placeholder="Ex: 150.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clv">CLV - Customer Lifetime Value (R$)</Label>
                  <Input
                    id="clv"
                    type="number"
                    step="0.01"
                    value={clv}
                    onChange={(e) => setClv(e.target.value)}
                    placeholder="Ex: 5000.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cac">CAC - Custo de Aquisição de Cliente (R$)</Label>
                  <Input
                    id="cac"
                    type="number"
                    step="0.01"
                    value={cac}
                    onChange={(e) => setCac(e.target.value)}
                    placeholder="Ex: 500.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ebitda_projetado">EBITDA Projetado (%)</Label>
                  <Input
                    id="ebitda_projetado"
                    type="number"
                    step="0.01"
                    value={ebitdaProjetado}
                    onChange={(e) => setEbitdaProjetado(e.target.value)}
                    placeholder="Ex: 25.5"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveData}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Creation Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo membro à equipe e atribua uma função
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Warning banner */}
              <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Nota:</strong> A criação de usuários requer implementação server-side via Supabase Edge Function. 
                  Por enquanto, use o painel de administração do Supabase para criar usuários manualmente.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Senha *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-name">Nome Completo *</Label>
                <Input
                  id="user-name"
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Função *</Label>
                <Select
                  value={newUserForm.role}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}
                >
                  <SelectTrigger id="user-role">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="secretaria">Secretaria</SelectItem>
                    <SelectItem value="treinador">Treinador</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    {profile?.role === 'master' && (
                      <>
                        <SelectItem value="proprietario">Proprietário</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                        <SelectItem value="empresa">Empresa</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Settings;
