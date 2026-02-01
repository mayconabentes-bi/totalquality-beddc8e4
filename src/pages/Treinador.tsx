import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, LogOut, TrendingUp, Award, Target } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface PerformanceRanking {
  id: string;
  student_id: string;
  score: number;
  technique_score: number | null;
  load_score: number | null;
  attendance_score: number | null;
  evaluation_date: string;
  notes: string | null;
  students: { name: string };
}

const Treinador = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string>("");
  const [trainerId, setTrainerId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [todayEvaluations, setTodayEvaluations] = useState<PerformanceRanking[]>([]);
  const [loading, setLoading] = useState(true);

  // Evaluation form state
  const [evaluationForm, setEvaluationForm] = useState({
    student_id: "",
    score: 50,
    technique_score: 50,
    load_score: 50,
    attendance_score: 50,
    notes: ""
  });

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
        .select("id, company_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        setTrainerId(profile.id);
        await Promise.all([
          fetchStudents(profile.company_id),
          fetchTodayEvaluations(profile.company_id)
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (companyId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("status", "ativo")
      .order("name");

    if (!error && data) {
      setStudents(data);
    }
  };

  const fetchTodayEvaluations = async (companyId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("performance_rankings")
      .select(`
        *,
        students (name)
      `)
      .eq("company_id", companyId)
      .eq("evaluation_date", today)
      .order("score", { ascending: false });

    if (!error && data) {
      setTodayEvaluations(data as PerformanceRanking[]);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!evaluationForm.student_id) {
      toast.error("Selecione um aluno");
      return;
    }

    const { error } = await supabase.from("performance_rankings").insert({
      company_id: companyId,
      student_id: evaluationForm.student_id,
      trainer_id: trainerId,
      score: evaluationForm.score,
      technique_score: evaluationForm.technique_score,
      load_score: evaluationForm.load_score,
      attendance_score: evaluationForm.attendance_score,
      notes: evaluationForm.notes || null
    });

    if (error) {
      toast.error("Erro ao registrar avaliação");
      console.error(error);
    } else {
      toast.success("Avaliação registrada com sucesso!");
      setEvaluationForm({
        student_id: "",
        score: 50,
        technique_score: 50,
        load_score: 50,
        attendance_score: 50,
        notes: ""
      });
      fetchTodayEvaluations(companyId);
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
                Treinador - Total<span className="gradient-text">Quality</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evaluation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Avaliação Diária de Alunos
                </CardTitle>
                <CardDescription>
                  Avalie o desempenho dos alunos baseado em técnica, carga e assiduidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="student">Selecione o Aluno</Label>
                  <Select
                    value={evaluationForm.student_id}
                    onValueChange={(value) => setEvaluationForm({ ...evaluationForm, student_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label>Nota Geral (0-100)</Label>
                      <span className="text-sm font-medium">{evaluationForm.score}</span>
                    </div>
                    <Slider
                      value={[evaluationForm.score]}
                      onValueChange={([value]) => setEvaluationForm({ ...evaluationForm, score: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label>Técnica (0-100)</Label>
                      <span className="text-sm font-medium">{evaluationForm.technique_score}</span>
                    </div>
                    <Slider
                      value={[evaluationForm.technique_score]}
                      onValueChange={([value]) => setEvaluationForm({ ...evaluationForm, technique_score: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label>Carga (0-100)</Label>
                      <span className="text-sm font-medium">{evaluationForm.load_score}</span>
                    </div>
                    <Slider
                      value={[evaluationForm.load_score]}
                      onValueChange={([value]) => setEvaluationForm({ ...evaluationForm, load_score: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label>Assiduidade (0-100)</Label>
                      <span className="text-sm font-medium">{evaluationForm.attendance_score}</span>
                    </div>
                    <Slider
                      value={[evaluationForm.attendance_score]}
                      onValueChange={([value]) => setEvaluationForm({ ...evaluationForm, attendance_score: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={evaluationForm.notes}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, notes: e.target.value })}
                    placeholder="Adicione comentários sobre o desempenho do aluno"
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitEvaluation} className="w-full">
                  Registrar Avaliação
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Today's Evaluations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Avaliações de Hoje
                </CardTitle>
                <CardDescription>
                  Alunos avaliados hoje ordenados por desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayEvaluations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma avaliação registrada hoje
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todayEvaluations.map((evaluation, index) => (
                      <div
                        key={evaluation.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-200 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{evaluation.students.name}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {evaluation.technique_score && (
                                <span>Téc: {evaluation.technique_score}</span>
                              )}
                              {evaluation.load_score && (
                                <span>Carga: {evaluation.load_score}</span>
                              )}
                              {evaluation.attendance_score && (
                                <span>Ass: {evaluation.attendance_score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-lg">{evaluation.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Treinador;
