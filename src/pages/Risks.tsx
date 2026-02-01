import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldAlert, 
  ArrowLeft,
  Plus,
  Edit,
  Trash2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Risk {
  id: string;
  company_id: string;
  description: string;
  category: 'operacional' | 'financeiro' | 'mercado';
  probability: number;
  impact: number;
  mitigation_plan: string | null;
}

interface Profile {
  company_id: string | null;
}

const Risks = () => {
  const navigate = useNavigate();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    category: "operacional" as 'operacional' | 'financeiro' | 'mercado',
    probability: 3,
    impact: 3,
    mitigation_plan: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.company_id) {
      fetchRisks();
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

  const fetchRisks = async () => {
    if (!profile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from("risks")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error) {
      console.error("Error fetching risks:", error);
      toast.error("Erro ao carregar riscos");
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
      if (editingRisk) {
        const { error } = await supabase
          .from("risks")
          .update(formData)
          .eq("id", editingRisk.id);

        if (error) throw error;
        toast.success("Risco atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("risks")
          .insert({
            ...formData,
            company_id: profile.company_id
          });

        if (error) throw error;
        toast.success("Risco cadastrado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingRisk(null);
      setFormData({
        description: "",
        category: "operacional",
        probability: 3,
        impact: 3,
        mitigation_plan: ""
      });
      fetchRisks();
    } catch (error) {
      console.error("Error saving risk:", error);
      toast.error("Erro ao salvar risco");
    }
  };

  const handleEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      description: risk.description,
      category: risk.category,
      probability: risk.probability,
      impact: risk.impact,
      mitigation_plan: risk.mitigation_plan || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este risco?")) return;

    try {
      const { error } = await supabase
        .from("risks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Risco excluído com sucesso!");
      fetchRisks();
    } catch (error) {
      console.error("Error deleting risk:", error);
      toast.error("Erro ao excluir risco");
    }
  };

  const getRiskLevel = (probability: number, impact: number) => {
    const score = probability * impact;
    if (score <= 5) return { label: "Baixo", color: "bg-green-500" };
    if (score <= 12) return { label: "Médio", color: "bg-yellow-500" };
    if (score <= 20) return { label: "Alto", color: "bg-orange-500" };
    return { label: "Crítico", color: "bg-red-500" };
  };

  const getRiskColor = (probability: number, impact: number) => {
    const score = probability * impact;
    if (score <= 5) return "bg-green-100 border-green-300";
    if (score <= 12) return "bg-yellow-100 border-yellow-300";
    if (score <= 20) return "bg-orange-100 border-orange-300";
    return "bg-red-100 border-red-300";
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
                  <ShieldAlert className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Gestão de Riscos
                </span>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingRisk(null);
                  setFormData({
                    description: "",
                    category: "operacional",
                    probability: 3,
                    impact: 3,
                    mitigation_plan: ""
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Risco
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRisk ? "Editar Risco" : "Cadastrar Novo Risco"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do risco abaixo
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="description">Descrição do Risco</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: 'Operacional' | 'Financeiro' | 'Mercado') => 
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operacional">Operacional</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="mercado">Mercado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="probability">Probabilidade (1-5)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="impact">Impacto (1-5)</Label>
                      <Input
                        id="impact"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.impact}
                        onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mitigation_plan">Plano de Mitigação</Label>
                    <Textarea
                      id="mitigation_plan"
                      value={formData.mitigation_plan}
                      onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingRisk(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingRisk ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk Matrix 5x5 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Matriz de Riscos (Probabilidade x Impacto)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-6 gap-2">
                  {/* Header */}
                  <div className="text-center font-semibold text-sm"></div>
                  {[1, 2, 3, 4, 5].map((impact) => (
                    <div key={impact} className="text-center font-semibold text-sm">
                      Impacto {impact}
                    </div>
                  ))}
                  
                  {/* Matrix cells */}
                  {[5, 4, 3, 2, 1].map((probability) => (
                    <>
                      <div key={`prob-${probability}`} className="text-center font-semibold text-sm flex items-center justify-center">
                        Prob. {probability}
                      </div>
                      {[1, 2, 3, 4, 5].map((impact) => {
                        const cellRisks = risks.filter(
                          r => r.probability === probability && r.impact === impact
                        );
                        const riskLevel = getRiskLevel(probability, impact);
                        
                        return (
                          <div
                            key={`${probability}-${impact}`}
                            className={`border-2 rounded-lg p-3 min-h-[100px] ${getRiskColor(probability, impact)}`}
                          >
                            <div className={`text-xs font-semibold mb-2 ${riskLevel.color} text-white px-2 py-1 rounded inline-block`}>
                              {riskLevel.label}
                            </div>
                            {cellRisks.length > 0 && (
                              <div className="text-xs space-y-1">
                                {cellRisks.map((risk) => (
                                  <div key={risk.id} className="truncate" title={risk.description}>
                                    • {risk.description.substring(0, 30)}...
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {risks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum risco cadastrado ainda.
                </p>
              ) : (
                risks.map((risk) => {
                  const riskLevel = getRiskLevel(risk.probability, risk.impact);
                  return (
                    <div
                      key={risk.id}
                      className={`border-2 rounded-lg p-4 ${getRiskColor(risk.probability, risk.impact)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold ${riskLevel.color} text-white px-2 py-1 rounded`}>
                              {riskLevel.label}
                            </span>
                            <span className="text-xs bg-white px-2 py-1 rounded border">
                              {risk.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {risk.description}
                          </h3>
                          <div className="text-sm text-muted-foreground mb-2">
                            Probabilidade: {risk.probability} | Impacto: {risk.impact}
                          </div>
                          {risk.mitigation_plan && (
                            <div className="text-sm">
                              <span className="font-semibold">Plano de Mitigação:</span> {risk.mitigation_plan}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(risk)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(risk.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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

export default Risks;
