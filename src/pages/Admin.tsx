import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle, 
  LogOut, 
  ArrowLeft,
  Brain,
  LineChart
} from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  market_intelligence: unknown;
  statistical_studies: unknown;
}

const Admin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, cnpj, market_intelligence, statistical_studies")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar empresas");
        console.error("Error fetching companies:", error);
      } else {
        setCompanies(data || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
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
            Painel Central de Gestão
          </h1>
          <p className="text-muted-foreground">
            Visão geral de todas as empresas cadastradas no sistema
          </p>
        </div>

        {/* Companies Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-center" aria-label="Status de Inteligência de Mercado">Inteligência de Mercado</TableHead>
                <TableHead className="text-center" aria-label="Status de Estudos Estatísticos">Estudos Estatísticos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma empresa cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.cnpj || "—"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Brain 
                          className={`w-5 h-5 ${
                            hasData(company.market_intelligence)
                              ? "text-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <LineChart 
                          className={`w-5 h-5 ${
                            hasData(company.statistical_studies)
                              ? "text-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
