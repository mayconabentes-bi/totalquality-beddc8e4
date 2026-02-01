import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle, LogOut, Plus, Users, Activity, UserPlus, Eye } from "lucide-react";

interface Modality {
  id: string;
  name: string;
  description: string | null;
}

interface Student {
  id: string;
  name: string;
  cpf: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'Ativo' | 'Inativo' | 'Cancelado';
  cancellation_reason: string | null;
  dependents: Record<string, unknown> | unknown[];
  geo_economic_profile: string | null;
}

interface StudentFlow {
  id: string;
  visitor_name: string;
  visit_type: 'Visita sem Aula' | 'Visita com Aula Agendada';
  visit_date: string;
  converted_to_student: boolean;
}

const Secretaria = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string>("");
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [visits, setVisits] = useState<StudentFlow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modality form state
  const [modalityForm, setModalityForm] = useState({ name: "", description: "" });
  const [modalityDialogOpen, setModalityDialogOpen] = useState(false);

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: "", cpf: "", address: "", phone: "", email: "",
    status: "Ativo" as 'Ativo' | 'Inativo' | 'Cancelado',
    cancellation_reason: "", geo_economic_profile: "", dependents: "[]"
  });
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);

  // Visit form state
  const [visitForm, setVisitForm] = useState({
    visitor_name: "",
    visit_type: "Visita sem Aula" as 'Visita sem Aula' | 'Visita com Aula Agendada'
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

  const fetchModalities = async (companyId: string) => {
    const { data, error } = await supabase
      .from("modalities")
      .select("*")
      .eq("company_id", companyId)
      .order("name");

    if (!error && data) {
      setModalities(data);
    }
  };

  const fetchStudents = async (companyId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("company_id", companyId)
      .order("name");

    if (!error && data) {
      setStudents(data);
    }
  };

  const fetchVisits = async (companyId: string) => {
    const { data, error } = await supabase
      .from("student_flow")
      .select("*")
      .eq("company_id", companyId)
      .order("visit_date", { ascending: false })
      .limit(10);

    if (!error && data) {
      setVisits(data);
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
      description: modalityForm.description || null
    });

    if (error) {
      toast.error("Erro ao criar modalidade");
      console.error(error);
    } else {
      toast.success("Modalidade criada com sucesso!");
      setModalityForm({ name: "", description: "" });
      setModalityDialogOpen(false);
      fetchModalities(companyId);
    }
  };

  const handleCreateStudent = async () => {
    if (!studentForm.name) {
      toast.error("Nome do aluno é obrigatório");
      return;
    }

    if (studentForm.status === 'Cancelado' && !studentForm.cancellation_reason) {
      toast.error("Motivo de cancelamento é obrigatório quando status é Cancelado");
      return;
    }

    let dependentsJson;
    try {
      dependentsJson = JSON.parse(studentForm.dependents);
    } catch {
      toast.error("Formato inválido para dependentes (deve ser JSON válido)");
      return;
    }

    const { error } = await supabase.from("students").insert({
      company_id: companyId,
      name: studentForm.name,
      cpf: studentForm.cpf || null,
      address: studentForm.address || null,
      phone: studentForm.phone || null,
      email: studentForm.email || null,
      status: studentForm.status,
      cancellation_reason: studentForm.status === 'Cancelado' ? studentForm.cancellation_reason : null,
      geo_economic_profile: studentForm.geo_economic_profile || null,
      dependents: dependentsJson
    });

    if (error) {
      toast.error("Erro ao criar aluno");
      console.error(error);
    } else {
      toast.success("Aluno cadastrado com sucesso!");
      setStudentForm({
        name: "", cpf: "", address: "", phone: "", email: "",
        status: "Ativo", cancellation_reason: "", geo_economic_profile: "", dependents: "[]"
      });
      setStudentDialogOpen(false);
      fetchStudents(companyId);
    }
  };

  const handleRegisterVisit = async () => {
    if (!visitForm.visitor_name) {
      toast.error("Nome do visitante é obrigatório");
      return;
    }

    const { error } = await supabase.from("student_flow").insert({
      company_id: companyId,
      visitor_name: visitForm.visitor_name,
      visit_type: visitForm.visit_type
    });

    if (error) {
      toast.error("Erro ao registrar visita");
      console.error(error);
    } else {
      toast.success("Visita registrada com sucesso!");
      setVisitForm({ visitor_name: "", visit_type: "Visita sem Aula" });
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                    <DialogDescription>Preencha os dados completos do aluno</DialogDescription>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={studentForm.cpf}
                          onChange={(e) => setStudentForm({ ...studentForm, cpf: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={studentForm.address}
                        onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="geo_economic_profile">Perfil Geoeconômico</Label>
                      <Input
                        id="geo_economic_profile"
                        value={studentForm.geo_economic_profile}
                        onChange={(e) => setStudentForm({ ...studentForm, geo_economic_profile: e.target.value })}
                        placeholder="Ex: Classe A, Região Centro"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dependents">Dependentes (JSON)</Label>
                      <Textarea
                        id="dependents"
                        value={studentForm.dependents}
                        onChange={(e) => setStudentForm({ ...studentForm, dependents: e.target.value })}
                        placeholder='[{"name": "João", "age": 10}]'
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={studentForm.status}
                        onValueChange={(value: 'Ativo' | 'Inativo' | 'Cancelado') =>
                          setStudentForm({ ...studentForm, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {studentForm.status === 'Cancelado' && (
                      <div className="grid gap-2">
                        <Label htmlFor="cancellation_reason">Motivo de Cancelamento *</Label>
                        <Textarea
                          id="cancellation_reason"
                          value={studentForm.cancellation_reason}
                          onChange={(e) => setStudentForm({ ...studentForm, cancellation_reason: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreateStudent}>Cadastrar Aluno</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{student.name}</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        student.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        student.status === 'Inativo' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {student.email && `${student.email} • `}
                      {student.phone && student.phone}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {student.cpf && <p>CPF: {student.cpf}</p>}
                      {student.address && <p>Endereço: {student.address}</p>}
                      {student.geo_economic_profile && <p>Perfil: {student.geo_economic_profile}</p>}
                      {student.status === 'Cancelado' && student.cancellation_reason && (
                        <p className="text-red-600">Motivo: {student.cancellation_reason}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                    <DialogDescription>Adicione uma nova modalidade ao sistema</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="modality-name">Nome *</Label>
                      <Input
                        id="modality-name"
                        value={modalityForm.name}
                        onChange={(e) => setModalityForm({ ...modalityForm, name: e.target.value })}
                        placeholder="Ex: Musculação, Jiu-Jitsu, Yoga"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="modality-description">Descrição</Label>
                      <Textarea
                        id="modality-description"
                        value={modalityForm.description}
                        onChange={(e) => setModalityForm({ ...modalityForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateModality}>Criar Modalidade</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modalities.map((modality) => (
                <Card key={modality.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {modality.name}
                    </CardTitle>
                    {modality.description && (
                      <CardDescription>{modality.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Funil de Vendas</h2>
              <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrar Visita
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Visita</DialogTitle>
                    <DialogDescription>Registre uma nova visita ao estabelecimento</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="visitor-name">Nome do Visitante *</Label>
                      <Input
                        id="visitor-name"
                        value={visitForm.visitor_name}
                        onChange={(e) => setVisitForm({ ...visitForm, visitor_name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="visit-type">Tipo de Visita</Label>
                      <Select
                        value={visitForm.visit_type}
                        onValueChange={(value: 'Visita sem Aula' | 'Visita com Aula Agendada') =>
                          setVisitForm({ ...visitForm, visit_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visita sem Aula">Visita sem Aula</SelectItem>
                          <SelectItem value="Visita com Aula Agendada">Visita com Aula Agendada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleRegisterVisit}>Registrar Visita</Button>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Visitas Recentes</CardTitle>
                <CardDescription>Últimas 10 visitas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{visit.visitor_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.visit_type} • {new Date(visit.visit_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        visit.converted_to_student ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {visit.converted_to_student ? 'Convertido' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Secretaria;
