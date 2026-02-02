import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle, 
  LogOut, 
  ArrowLeft,
  Settings2,
  Brain,
  LineChart,
  UserPlus,
  Users as UsersIcon,
  Key,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  data_abertura?: string | null;
  email?: string | null;
  phone?: string | null;
  full_address?: unknown;
  market_intelligence: unknown;
  statistical_studies: unknown;
  client_code?: string | null;
  client_since?: string | null;
  contract_end?: string | null;
  notes?: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  company_id: string | null;
  company?: {
    name: string;
  } | null;
}

interface MarketIntelligence {
  cnae_principal?: string;
  setor_atuacao?: string;
  geolocalizacao?: string;
  densidade_demografica_local?: string;
  indice_concorrencia?: number;
  [key: string]: string | number | undefined;
}

interface StatisticalStudies {
  churn_rate?: number;
  margin_per_student?: number;
  clv?: number;
  cac?: number;
  ebitda_projetado?: number;
  capital_social?: number;
  [key: string]: number | undefined;
}

interface FullAddress {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    name: "",
    role: ""
  });

  // Company registration state
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyForm, setNewCompanyForm] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    data_abertura: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    capital_social: "",
    phone: "",
    email: "",
    client_code: "",
    client_since: "",
    contract_end: "",
    notes: ""
  });

  // Access control modal state
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [accessConfig, setAccessConfig] = useState({
    modules: {
      axioma_mercado: false,
      axioma_estatistica: false,
      gestao_riscos: false,
      nps: false,
      manutencao: false
    },
    permissions: {
      pode_editar: false,
      pode_deletar: false,
      pode_exportar: false
    },
    delegated_company_id: ""
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
            // Build query with company info
            let teamQuery = supabase
              .from("profiles")
              .select(`
                *,
                company:companies(name)
              `);
            
            // If user is master, fetch ALL profiles (global visibility)
            // Otherwise, filter by company_id
            if (profileData.role !== 'master' && profileData.company_id) {
              teamQuery = teamQuery.eq("company_id", profileData.company_id);
            }
            
            const { data: teamData } = await teamQuery.order("full_name");

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
    if (!profile) return;
    
    try {
      // Build query with company info
      let query = supabase
        .from("profiles")
        .select(`
          *,
          company:companies(name)
        `);
      
      // If user is master, fetch ALL profiles (global visibility)
      // Otherwise, filter by company_id
      if (profile.role !== 'master' && profile.company_id) {
        query = query.eq("company_id", profile.company_id);
      }
      
      const { data, error } = await query.order("full_name");

      if (!error && data) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // Helper function to categorize roles
  const getRoleCategory = (role: string | null): string => {
    if (!role) return "other";
    
    if (role === "master") return "master";
    if (role === "proprietario") return "proprietario";
    if (["auditor", "total_quality_iso"].includes(role)) return "auditoria";
    if (["secretaria", "treinador", "recepcionista", "manutencao", "estacionamento"].includes(role)) return "operacional";
    
    return "other";
  };

  // Filter team members based on search and category
  const getFilteredTeamMembers = () => {
    let filtered = teamMembers;

    // Filter by search query (name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        (member.full_name?.toLowerCase().includes(query)) ||
        (member.id.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(member => 
        getRoleCategory(member.role) === selectedCategory
      );
    }

    return filtered;
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.name || !newUserForm.role) {
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

  const fetchCompanies = useCallback(async () => {
    if (!user || profile?.role !== 'master') return;
    
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (!error && data) {
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, [user, profile?.role]);

  // Fetch companies on mount for master users
  useEffect(() => {
    if (user && profile?.role === 'master') {
      fetchCompanies();
    }
  }, [user, profile?.role, fetchCompanies]);

  const formatCNPJ = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply CNPJ mask: XX.XXX.XXX/XXXX-XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setNewCompanyForm({ ...newCompanyForm, cnpj: formatted });
  };

  const validateCNPJ = (cnpj: string): boolean => {
    // Remove non-digits
    const digits = cnpj.replace(/\D/g, '');
    return digits.length === 14;
  };

  const handleCapitalSocialChange = (value: string) => {
    // Allow only numbers, dots, and commas
    const sanitized = value.replace(/[^\d.,]/g, '');
    setNewCompanyForm({ ...newCompanyForm, capital_social: sanitized });
  };

  const handleOpenCompanyDialog = () => {
    // Set today's date as default for client_since
    const today = new Date().toISOString().split('T')[0];
    
    // Note: client_code will be auto-generated by the database trigger
    // We show a placeholder to indicate it will be generated
    setNewCompanyForm({
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      data_abertura: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      capital_social: "",
      phone: "",
      email: "",
      client_code: "(será gerado automaticamente)",
      client_since: today,
      contract_end: "",
      notes: ""
    });
    
    setCompanyDialogOpen(true);
  };

  const handleCreateCompany = async () => {
    // Validate required fields
    if (!newCompanyForm.cnpj || !newCompanyForm.razao_social) {
      toast.error("CNPJ e Razão Social são obrigatórios");
      return;
    }

    // Validate CNPJ has 14 digits
    if (!validateCNPJ(newCompanyForm.cnpj)) {
      toast.error("CNPJ deve ter exatamente 14 dígitos");
      return;
    }

    if (!user) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      // Prepare full_address JSONB
      const fullAddress: FullAddress = {
        cep: newCompanyForm.cep || undefined,
        logradouro: newCompanyForm.logradouro || undefined,
        numero: newCompanyForm.numero || undefined,
        complemento: newCompanyForm.complemento || undefined,
        bairro: newCompanyForm.bairro || undefined,
      };

      // Prepare statistical_studies JSONB with capital_social
      const statisticalStudies: StatisticalStudies = {};
      if (newCompanyForm.capital_social) {
        // Parse Brazilian currency format (e.g., "1.000.000,00" or "1000000.00")
        // Remove all dots (thousand separators), replace comma with dot (decimal separator)
        let cleanValue = newCompanyForm.capital_social.trim();
        // If contains both dot and comma, assume Brazilian format (dots for thousands, comma for decimal)
        if (cleanValue.includes('.') && cleanValue.includes(',')) {
          cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
        } 
        // If only comma, replace with dot
        else if (cleanValue.includes(',')) {
          cleanValue = cleanValue.replace(',', '.');
        }
        // Remove any remaining non-numeric characters except dot
        cleanValue = cleanValue.replace(/[^\d.]/g, '');
        
        const capitalValue = parseFloat(cleanValue);
        if (!isNaN(capitalValue) && capitalValue >= 0) {
          statisticalStudies.capital_social = capitalValue;
        }
      }

      // Insert company
      const { data, error } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          name: newCompanyForm.razao_social, // Use razao_social as name
          cnpj: newCompanyForm.cnpj.replace(/\D/g, ''), // Store only digits
          razao_social: newCompanyForm.razao_social,
          nome_fantasia: newCompanyForm.nome_fantasia || null,
          data_abertura: newCompanyForm.data_abertura || null,
          email: newCompanyForm.email || null,
          phone: newCompanyForm.phone || null,
          full_address: fullAddress,
          statistical_studies: statisticalStudies,
          // client_code is auto-generated by database trigger, don't send it
          client_since: newCompanyForm.client_since || null,
          contract_end: newCompanyForm.contract_end || null,
          notes: newCompanyForm.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating company:", error);
        toast.error("Erro ao criar empresa: " + error.message);
      } else {
        toast.success("Empresa criada com sucesso!");
        setCompanyDialogOpen(false);
        // Reset form
        setNewCompanyForm({
          cnpj: "",
          razao_social: "",
          nome_fantasia: "",
          data_abertura: "",
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          capital_social: "",
          phone: "",
          email: "",
          client_code: "",
          client_since: "",
          contract_end: "",
          notes: ""
        });
        // Refresh companies list
        fetchCompanies();
      }
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error("Erro ao criar empresa");
    }
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

  // Access control handlers
  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleOpenAccessModal = () => {
    if (selectedUserIds.length === 0) {
      toast.error("Selecione pelo menos um usuário");
      return;
    }
    
    // Reset config
    setAccessConfig({
      modules: {
        axioma_mercado: false,
        axioma_estatistica: false,
        gestao_riscos: false,
        nps: false,
        manutencao: false
      },
      permissions: {
        pode_editar: false,
        pode_deletar: false,
        pode_exportar: false
      },
      delegated_company_id: profile?.company_id || ""
    });
    
    setAccessModalOpen(true);
  };

  const handleSaveAccessControl = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Nenhum usuário selecionado");
      return;
    }

    // Validate that a company is selected
    const targetCompanyId = accessConfig.delegated_company_id || profile?.company_id;
    if (!targetCompanyId) {
      toast.error("Selecione uma empresa para delegação");
      return;
    }

    try {
      // Update all selected users with the configured access
      const updates = selectedUserIds.map(userId => 
        supabase
          .from("profiles")
          .update({
            active_modules: accessConfig.modules,
            user_permissions: accessConfig.permissions,
            company_id: targetCompanyId
          })
          .eq("id", userId)
      );

      await Promise.all(updates);

      toast.success(`Acessos configurados para ${selectedUserIds.length} usuário(s)`);
      setAccessModalOpen(false);
      setSelectedUserIds([]);
      
      // Refresh team members
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating access control:", error);
      toast.error("Erro ao configurar acessos");
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

        {/* Companies Management Section - Only for master role */}
        {profile?.role === 'master' && (
          <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Empresas Cadastradas
                </h2>
                <p className="text-muted-foreground">
                  Gerencie as empresas clientes do sistema
                </p>
              </div>
              <Button onClick={handleOpenCompanyDialog} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <UserPlus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </div>

            {/* Companies List */}
            <div className="space-y-3">
              {companies.map((comp) => (
                <div 
                  key={comp.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {comp.client_code && <span className="text-primary font-semibold">{comp.client_code} • </span>}
                        {comp.razao_social || comp.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {comp.cnpj ? formatCNPJ(comp.cnpj) : "—"}
                        {comp.nome_fantasia && ` • ${comp.nome_fantasia}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ID: {comp.id.substring(0, 8)}...
                  </span>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma empresa cadastrada ainda
                </p>
              )}
            </div>
          </div>
        )}

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
              <div className="flex gap-2">
                <Button 
                  onClick={handleOpenAccessModal} 
                  className="gap-2"
                  variant={selectedUserIds.length > 0 ? "default" : "secondary"}
                  disabled={selectedUserIds.length === 0}
                >
                  <Key className="w-4 h-4" />
                  Configurar Acessos e Delegação
                  {selectedUserIds.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary-foreground text-primary rounded-full text-xs">
                      {selectedUserIds.length}
                    </span>
                  )}
                </Button>
                <Button onClick={() => setUserDialogOpen(true)} className="gap-2" variant="outline">
                  <UserPlus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="master">Master</TabsTrigger>
                <TabsTrigger value="proprietario">Proprietário</TabsTrigger>
                <TabsTrigger value="operacional">Operacional</TabsTrigger>
                <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Team Members List */}
            <div className="space-y-3">
              {getFilteredTeamMembers().map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedUserIds.includes(member.id)}
                      onCheckedChange={() => handleToggleUserSelection(member.id)}
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{member.full_name || "Sem nome"}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role || "Sem role"} • {member.company?.name || "Sem Unidade"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    member.role === 'master' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'proprietario' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'secretaria' ? 'bg-green-100 text-green-800' :
                    member.role === 'treinador' ? 'bg-orange-100 text-orange-800' :
                    member.role === 'auditor' ? 'bg-red-100 text-red-800' :
                    member.role === 'total_quality_iso' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
              {getFilteredTeamMembers().length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery || selectedCategory !== "all" 
                    ? "Nenhum usuário encontrado com os filtros selecionados" 
                    : "Nenhum membro da equipe encontrado"}
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
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
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

        {/* Company Registration Dialog */}
        <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
              <DialogDescription>
                Preencha os dados oficiais da Receita Federal do Brasil
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Identificação */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Identificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-cnpj">CNPJ *</Label>
                    <Input
                      id="company-cnpj"
                      value={newCompanyForm.cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                    {newCompanyForm.cnpj && !validateCNPJ(newCompanyForm.cnpj) && (
                      <p className="text-sm text-red-500">CNPJ deve ter 14 dígitos</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-data-abertura">Data de Abertura</Label>
                    <Input
                      id="company-data-abertura"
                      type="date"
                      value={newCompanyForm.data_abertura}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, data_abertura: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-razao-social">Razão Social *</Label>
                  <Input
                    id="company-razao-social"
                    value={newCompanyForm.razao_social}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, razao_social: e.target.value })}
                    placeholder="Nome oficial da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-nome-fantasia">Nome Fantasia</Label>
                  <Input
                    id="company-nome-fantasia"
                    value={newCompanyForm.nome_fantasia}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, nome_fantasia: e.target.value })}
                    placeholder="Nome comercial"
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-cep">CEP</Label>
                    <Input
                      id="company-cep"
                      value={newCompanyForm.cep}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, cep: e.target.value })}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-logradouro">Logradouro</Label>
                    <Input
                      id="company-logradouro"
                      value={newCompanyForm.logradouro}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, logradouro: e.target.value })}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-numero">Número</Label>
                    <Input
                      id="company-numero"
                      value={newCompanyForm.numero}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, numero: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-complemento">Complemento</Label>
                    <Input
                      id="company-complemento"
                      value={newCompanyForm.complemento}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, complemento: e.target.value })}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-bairro">Bairro</Label>
                    <Input
                      id="company-bairro"
                      value={newCompanyForm.bairro}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, bairro: e.target.value })}
                      placeholder="Nome do bairro"
                    />
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Estatísticas</h3>
                <div className="space-y-2">
                  <Label htmlFor="company-capital-social">Capital Social (R$)</Label>
                  <Input
                    id="company-capital-social"
                    type="text"
                    value={newCompanyForm.capital_social}
                    onChange={(e) => handleCapitalSocialChange(e.target.value)}
                    placeholder="1000000.00 ou 1.000.000,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aceita formato brasileiro (1.000.000,00) ou internacional (1000000.00)
                  </p>
                </div>
              </div>

              {/* Contatos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Contatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input
                      id="company-phone"
                      value={newCompanyForm.phone}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">E-mail</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={newCompanyForm.email}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>
              </div>

              {/* Governança e Contrato */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Governança e Contrato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-client-code">Código do Cliente</Label>
                    <Input
                      id="company-client-code"
                      value={newCompanyForm.client_code}
                      disabled
                      className="bg-muted cursor-not-allowed"
                      placeholder="TQ-XXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Gerado automaticamente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-client-since">Data de Registro</Label>
                    <Input
                      id="company-client-since"
                      type="date"
                      value={newCompanyForm.client_since}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, client_since: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-contract-end">Término de Contrato</Label>
                  <Input
                    id="company-contract-end"
                    type="date"
                    value={newCompanyForm.contract_end}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, contract_end: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Data prevista para término do contrato
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-notes">Anotações/Observações</Label>
                  <Textarea
                    id="company-notes"
                    value={newCompanyForm.notes}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, notes: e.target.value })}
                    placeholder="Detalhes estratégicos sobre o cliente..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Informações estratégicas, observações e notas importantes
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCompany}>
                Cadastrar Empresa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Access Control Modal */}
        <Dialog open={accessModalOpen} onOpenChange={setAccessModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurar Acessos e Delegação</DialogTitle>
              <DialogDescription>
                Configure os módulos ativos, permissões e empresa delegada para {selectedUserIds.length} usuário(s) selecionado(s)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Block 1: Plano Contratado - Módulos */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-foreground">
                    Bloco 1: Plano Contratado - Módulos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione quais módulos estarão disponíveis
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="axioma-mercado" className="font-medium">
                        Axioma (Mercado)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Inteligência de mercado e análises
                      </p>
                    </div>
                    <Switch
                      id="axioma-mercado"
                      checked={accessConfig.modules.axioma_mercado}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          modules: { ...prev.modules, axioma_mercado: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="axioma-estatistica" className="font-medium">
                        Axioma (Estatística)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Estudos estatísticos e indicadores
                      </p>
                    </div>
                    <Switch
                      id="axioma-estatistica"
                      checked={accessConfig.modules.axioma_estatistica}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          modules: { ...prev.modules, axioma_estatistica: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="gestao-riscos" className="font-medium">
                        Gestão de Riscos
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Matriz de riscos e mitigação
                      </p>
                    </div>
                    <Switch
                      id="gestao-riscos"
                      checked={accessConfig.modules.gestao_riscos}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          modules: { ...prev.modules, gestao_riscos: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="nps" className="font-medium">
                        NPS
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Net Promoter Score e feedbacks
                      </p>
                    </div>
                    <Switch
                      id="nps"
                      checked={accessConfig.modules.nps}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          modules: { ...prev.modules, nps: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="manutencao" className="font-medium">
                        Manutenção
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Gestão de ativos e manutenções
                      </p>
                    </div>
                    <Switch
                      id="manutencao"
                      checked={accessConfig.modules.manutencao}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          modules: { ...prev.modules, manutencao: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Block 2: Permissões de Uso */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-foreground">
                    Bloco 2: Permissões de Uso
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Defina o nível de acesso aos dados
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="pode-editar" className="font-medium">
                        Pode Editar Dados
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permite modificar informações
                      </p>
                    </div>
                    <Switch
                      id="pode-editar"
                      checked={accessConfig.permissions.pode_editar}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, pode_editar: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="pode-deletar" className="font-medium">
                        Pode Deletar Registros
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permite excluir dados permanentemente
                      </p>
                    </div>
                    <Switch
                      id="pode-deletar"
                      checked={accessConfig.permissions.pode_deletar}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, pode_deletar: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="pode-exportar" className="font-medium">
                        Pode Exportar Relatórios
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permite exportação de dados
                      </p>
                    </div>
                    <Switch
                      id="pode-exportar"
                      checked={accessConfig.permissions.pode_exportar}
                      onCheckedChange={(checked) => 
                        setAccessConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, pode_exportar: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Block 3: Delegação */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-foreground">
                    Bloco 3: Delegação
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha a empresa à qual vincular esses usuários
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegated-company">Empresa</Label>
                  <Select
                    value={accessConfig.delegated_company_id}
                    onValueChange={(value) => 
                      setAccessConfig(prev => ({ ...prev, delegated_company_id: value }))
                    }
                  >
                    <SelectTrigger id="delegated-company">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {profile?.role === 'master' ? (
                        companies.map(comp => (
                          <SelectItem key={comp.id} value={comp.id}>
                            {comp.client_code ? `${comp.client_code} - ` : ''}{comp.razao_social || comp.name}
                          </SelectItem>
                        ))
                      ) : (
                        company && (
                          <SelectItem value={company.id}>
                            {company.client_code ? `${company.client_code} - ` : ''}{company.razao_social || company.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAccessModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAccessControl}>
                Salvar Configurações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Settings;
