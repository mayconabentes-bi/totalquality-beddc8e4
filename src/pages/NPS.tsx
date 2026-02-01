import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  ArrowLeft,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NPSFeedback {
  id: string;
  company_id: string;
  score: number;
  comment: string | null;
  student_name: string | null;
  created_at: string;
}

interface Profile {
  company_id: string | null;
}

const NPS = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<NPSFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    score: 7,
    comment: "",
    student_name: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.company_id) {
      fetchFeedbacks();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("nps_feedback")
        .select("*")
        .eq("company_id", profile?.company_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Erro ao carregar feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.company_id) {
      toast.error("Empresa não encontrada");
      return;
    }

    try {
      const { error } = await supabase
        .from("nps_feedback")
        .insert({
          ...formData,
          company_id: profile.company_id
        });

      if (error) throw error;
      toast.success("Feedback cadastrado com sucesso!");

      setIsDialogOpen(false);
      setFormData({
        score: 7,
        comment: "",
        student_name: ""
      });
      fetchFeedbacks();
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Erro ao salvar feedback");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este feedback?")) return;

    try {
      const { error } = await supabase
        .from("nps_feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Feedback excluído com sucesso!");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Erro ao excluir feedback");
    }
  };

  const calculateNPS = () => {
    if (feedbacks.length === 0) return 0;
    
    const promoters = feedbacks.filter(f => f.score >= 9).length;
    const detractors = feedbacks.filter(f => f.score <= 6).length;
    
    return Math.round(((promoters - detractors) / feedbacks.length) * 100);
  };

  const getScoreCategory = (score: number) => {
    if (score >= 9) return { label: "Promotor", color: "text-green-600", icon: ThumbsUp };
    if (score >= 7) return { label: "Neutro", color: "text-yellow-600", icon: Minus };
    return { label: "Detrator", color: "text-red-600", icon: ThumbsDown };
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-100 border-green-300";
    if (score >= 7) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  const npsScore = calculateNPS();
  const promotersCount = feedbacks.filter(f => f.score >= 9).length;
  const neutralsCount = feedbacks.filter(f => f.score >= 7 && f.score <= 8).length;
  const detractorsCount = feedbacks.filter(f => f.score <= 6).length;

  const getNPSColor = (nps: number) => {
    if (nps >= 75) return "text-green-600";
    if (nps >= 50) return "text-lime-600";
    if (nps >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getNPSStatus = (nps: number) => {
    if (nps >= 75) return "Excelente";
    if (nps >= 50) return "Muito Bom";
    if (nps >= 0) return "Razoável";
    return "Ruim";
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Voz do Aluno (NPS)
                </span>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setFormData({
                    score: 7,
                    comment: "",
                    student_name: ""
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Feedback NPS</DialogTitle>
                  <DialogDescription>
                    Colete o feedback do aluno sobre a experiência
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="student_name">Nome do Aluno (opcional)</Label>
                    <Input
                      id="student_name"
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      placeholder="Nome do aluno"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="score">
                      Pontuação (0-10): {formData.score}
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs">0</span>
                      <input
                        id="score"
                        type="range"
                        min="0"
                        max="10"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs">10</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Pouco provável</span>
                      <span>Muito provável</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Comentário (opcional)</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="O que o aluno achou da experiência?"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NPS Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* NPS Score Gauge */}
          <Card>
            <CardHeader>
              <CardTitle>Net Promoter Score (NPS)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className={`text-7xl font-bold ${getNPSColor(npsScore)} mb-2`}>
                  {npsScore}
                </div>
                <div className="text-xl text-muted-foreground mb-4">
                  {getNPSStatus(npsScore)}
                </div>
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span>-100</span>
                    <span>0</span>
                    <span>+100</span>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background"
                      style={{ left: `${(npsScore + 100) / 2}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Baseado em {feedbacks.length} {feedbacks.length === 1 ? 'resposta' : 'respostas'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Categories Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">Promotores</div>
                      <div className="text-sm text-green-700">Pontuação 9-10</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {promotersCount}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Minus className="w-6 h-6 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-yellow-900">Neutros</div>
                      <div className="text-sm text-yellow-700">Pontuação 7-8</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {neutralsCount}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="font-semibold text-red-900">Detratores</div>
                      <div className="text-sm text-red-700">Pontuação 0-6</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {detractorsCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks List */}
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum feedback cadastrado ainda.
                </p>
              ) : (
                feedbacks.map((feedback) => {
                  const category = getScoreCategory(feedback.score);
                  const CategoryIcon = category.icon;
                  return (
                    <div
                      key={feedback.id}
                      className={`border-2 rounded-lg p-4 ${getScoreColor(feedback.score)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                            <span className={`font-semibold ${category.color}`}>
                              {category.label}
                            </span>
                            <span className="text-2xl font-bold">
                              {feedback.score}/10
                            </span>
                          </div>
                          {feedback.student_name && (
                            <p className="text-sm font-medium mb-1">
                              Aluno: {feedback.student_name}
                            </p>
                          )}
                          {feedback.comment && (
                            <p className="text-sm text-muted-foreground mb-2">
                              "{feedback.comment}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(feedback.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(feedback.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NPS;
