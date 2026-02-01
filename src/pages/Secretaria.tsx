import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle, LogOut, Plus, Users, Activity } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface Modality {
  id: string;
  name: string;
  category: string | null;
}

interface Student {
  id: string;
  name: string;
  status: string | null;
  cancel_reason: string | null;
  neighborhood: string | null;
  current_plan: string | null;
  current_payment_method: string | null;
  current_payment_status: string | null;
}

interface StudentFlow {
  id: string;
  type: string | null;
  details: Json | null;
  created_at: string | null;
}

const Secretaria = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string>("");
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [visits, setVisits] = useState<StudentFlow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modality form state
  const [modalityForm, setModalityForm] = useState({ name: "", category: "" });
  const [modalityDialogOpen, setModalityDialogOpen] = useState(false);

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: "",
    status: "ativo",
    neighborhood: "",
    current_plan: "mensal",
    current_payment_method: "pix",
    current_payment_status: "adimplente"
  });
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);

  // Visit form state
  const [visitForm, setVisitForm] = useState({
    type: "visita_sem_aula"
  });
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        await Promise.all([
          fetchModalities(profile.company_id),
          fetchStudents(profile.company_id),
          fetchVisits(profile.company_id)
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalities = async (compId: string) => {
    const { data, error } = await supabase
      .from("modalities")
      .select("id, name, category")
      .eq("company_id", compId)
      .order("name");

    if (!error && data) {
      setModalities(data);
    }
  };

  const fetchStudents = async (compId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, status, cancel_reason, neighborhood, current_plan, current_payment_method, current_payment_status")
      .eq("company_id", compId)
      .order("name");

    if (!error && data) {
      setStudents(data);
    }
  };

  const fetchVisits = async (compId: string) => {
    const { data, error } = await supabase
      .from("student_flow")
      .select("id, type, details, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      // Filter by company_id if needed - using type assertion due to complex query types
      const filtered = data.filter((d: { id: string }) => d.id);
      setVisits(filtered as StudentFlow[]);
    }
  };

  const handleCreateModality = async () => {
    if (!modalityForm.name) {
      toast.error("Nome da modalidade é obrigatório");
      return;
    }

    const { error } = await supabase.from("modalities").insert({
      company_id: companyId,
      name: modalityForm.name,
      category: modalityForm.category || null
    });

    if (error) {
      toast.error("Erro ao criar modalidade");
      console.error(error);
    } else {
      toast.success("Modalidade criada com sucesso!");
      setModalityForm({ name: "", category: "" });
      setModalityDialogOpen(false);
      fetchModalities(companyId);
    }
  };

  const handleCreateStudent = async () => {
    if (!studentForm.name) {
      toast.error("Nome do aluno é obrigatório");
      return;
    }

    const { error } = await supabase.from("students").insert({
      company_id: companyId,
      name: studentForm.name,
      status: studentForm.status,
      neighborhood: studentForm.neighborhood || null,
      current_plan: studentForm.current_plan as "mensal" | "bimestral" | "trimestral" | "semestral" | "anual",
      current_payment_method: studentForm.current_payment_method as "pix" | "credito" | "debito" | "boleto" | "recorrencia",
      current_payment_status: studentForm.current_payment_status as "adimplente" | "inadimplente"
    });

    if (error) {
      toast.error("Erro ao criar aluno");
      console.error(error);
    } else {
      toast.success("Aluno cadastrado com sucesso!");
      setStudentForm({
        name: "",
        status: "ativo",
        neighborhood: "",
        current_plan: "mensal",
        current_payment_method: "pix",
        current_payment_status: "adimplente"
      });
      setStudentDialogOpen(false);
      fetchStudents(companyId);
    }
  };

  const handleRegisterVisit = async () => {
    const { error } = await supabase.from("student_flow").insert({
      company_id: companyId,
      type: visitForm.type,
      details: {}
    });

    if (error) {
      toast.error("Erro ao registrar visita");
      console.error(error);
    } else {
      toast.success("Visita registrada com sucesso!");
      setVisitForm({ type: "visita_sem_aula" });
      setVisitDialogOpen(false);
      fetchVisits(companyId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
                Secretaria - Total<span className="gradient-text">Quality</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="modalities">Modalidades</TabsTrigger>
            <TabsTrigger value="visits">Funil de Vendas</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Alunos</h2>
              <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                    <DialogDescription>Preencha os dados do aluno</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={studentForm.neighborhood}
                        onChange={(e) => setStudentForm({ ...studentForm, neighborhood: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={studentForm.status}
                        onValueChange={(value) => setStudentForm({ ...studentForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="plan">Plano</Label>
                      <Select
                        value={studentForm.current_plan}
                        onValueChange={(value) => setStudentForm({ ...studentForm, current_plan: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="bimestral">Bimestral</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="semestral">Semestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method">Método de Pagamento</Label>
                      <Select
                        value={studentForm.current_payment_method}
                        onValueChange={(value) => setStudentForm({ ...studentForm, current_payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                          <SelectItem value="debito">Débito</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                          <SelectItem value="recorrencia">Recorrência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_status">Status de Pagamento</Label>
                      <Select
                        value={studentForm.current_payment_status}
                        onValueChange={(value) => setStudentForm({ ...studentForm, current_payment_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adimplente">Adimplente</SelectItem>
                          <SelectItem value="inadimplente">Inadimplente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreateStudent}>Cadastrar Aluno</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {students.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhum aluno cadastrado ainda.
                  </CardContent>
                </Card>
              ) : (
                students.map((student) => (
                  <Card key={student.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{student.name}</CardTitle>
                          <CardDescription>
                            {student.neighborhood || "Bairro não informado"} • {student.current_plan || "Plano não definido"}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'ativo' ? 'bg-green-100 text-green-800' :
                          student.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Pagamento: {student.current_payment_status}</span>
                        <span>Método: {student.current_payment_method}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Modalities Tab */}
          <TabsContent value="modalities" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Modalidades</h2>
              <Dialog open={modalityDialogOpen} onOpenChange={setModalityDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Modalidade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Nova Modalidade</DialogTitle>
                    <DialogDescription>Preencha os dados da modalidade</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="modality_name">Nome *</Label>
                      <Input
                        id="modality_name"
                        value={modalityForm.name}
                        onChange={(e) => setModalityForm({ ...modalityForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={modalityForm.category}
                        onChange={(e) => setModalityForm({ ...modalityForm, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateModality}>Cadastrar Modalidade</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {modalities.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhuma modalidade cadastrada ainda.
                  </CardContent>
                </Card>
              ) : (
                modalities.map((modality) => (
                  <Card key={modality.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{modality.name}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {modality.category || "Sem categoria"}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Funil de Vendas</h2>
              <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Visita
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Visita</DialogTitle>
                    <DialogDescription>Registre uma nova visita</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="visit_type">Tipo de Visita</Label>
                      <Select
                        value={visitForm.type}
                        onValueChange={(value) => setVisitForm({ ...visitForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visita_sem_aula">Visita sem Aula</SelectItem>
                          <SelectItem value="visita_com_aula_agendada">Visita com Aula Agendada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleRegisterVisit}>Registrar Visita</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {visits.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhuma visita registrada ainda.
                  </CardContent>
                </Card>
              ) : (
                visits.map((visit) => (
                  <Card key={visit.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          {visit.type === 'visita_com_aula_agendada' ? 'Visita com Aula' : 'Visita Simples'}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {visit.created_at ? new Date(visit.created_at).toLocaleDateString('pt-BR') : 'Data não registrada'}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Secretaria;
