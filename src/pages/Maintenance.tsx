import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wrench, 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaintenanceAsset {
  id: string;
  company_id: string;
  name: string;
  category: string;
  last_maintenance: string | null;
  next_maintenance: string | null;
  status: 'Ok' | 'Alerta' | 'Crítico';
}

interface Profile {
  company_id: string | null;
}

const Maintenance = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<MaintenanceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MaintenanceAsset | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    last_maintenance: "",
    next_maintenance: "",
    status: "Ok" as 'Ok' | 'Alerta' | 'Crítico'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.company_id) {
      fetchAssets();
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

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_assets")
        .select("*")
        .eq("company_id", profile?.company_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Erro ao carregar ativos");
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
      if (editingAsset) {
        const { error } = await supabase
          .from("maintenance_assets")
          .update(formData)
          .eq("id", editingAsset.id);

        if (error) throw error;
        toast.success("Ativo atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("maintenance_assets")
          .insert({
            ...formData,
            company_id: profile.company_id
          });

        if (error) throw error;
        toast.success("Ativo cadastrado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingAsset(null);
      setFormData({
        name: "",
        category: "",
        last_maintenance: "",
        next_maintenance: "",
        status: "Ok"
      });
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
      toast.error("Erro ao salvar ativo");
    }
  };

  const handleEdit = (asset: MaintenanceAsset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      last_maintenance: asset.last_maintenance || "",
      next_maintenance: asset.next_maintenance || "",
      status: asset.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ativo?")) return;

    try {
      const { error } = await supabase
        .from("maintenance_assets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Ativo excluído com sucesso!");
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Erro ao excluir ativo");
    }
  };

  const handleRegisterMaintenance = async (id: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextMaintenance = new Date();
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 3); // 3 months from now
      
      const { error } = await supabase
        .from("maintenance_assets")
        .update({
          last_maintenance: today,
          next_maintenance: nextMaintenance.toISOString().split('T')[0],
          status: "Ok"
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Manutenção registrada com sucesso!");
      fetchAssets();
    } catch (error) {
      console.error("Error registering maintenance:", error);
      toast.error("Erro ao registrar manutenção");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ok":
        return "bg-green-100 border-green-300 text-green-800";
      case "Alerta":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "Crítico":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ok":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Alerta":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "Crítico":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getDaysUntilMaintenance = (nextMaintenance: string | null) => {
    if (!nextMaintenance) return null;
    const today = new Date();
    const next = new Date(nextMaintenance);
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const countByStatus = (status: string) => {
    return assets.filter(a => a.status === status).length;
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
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Manutenção de Ativos
                </span>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAsset(null);
                  setFormData({
                    name: "",
                    category: "",
                    last_maintenance: "",
                    next_maintenance: "",
                    status: "Ok"
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ativo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAsset ? "Editar Ativo" : "Cadastrar Novo Ativo"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do ativo abaixo
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Ativo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Esteira 01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Equipamento de Musculação"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_maintenance">Última Manutenção</Label>
                    <Input
                      id="last_maintenance"
                      type="date"
                      value={formData.last_maintenance}
                      onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_maintenance">Próxima Manutenção</Label>
                    <Input
                      id="next_maintenance"
                      type="date"
                      value={formData.next_maintenance}
                      onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'Ok' | 'Alerta' | 'Crítico') => 
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ok">Ok</SelectItem>
                        <SelectItem value="Alerta">Alerta</SelectItem>
                        <SelectItem value="Crítico">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingAsset(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingAsset ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status: Ok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  {countByStatus("Ok")}
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status: Alerta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-yellow-600">
                  {countByStatus("Alerta")}
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status: Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">
                  {countByStatus("Crítico")}
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Ativos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum ativo cadastrado ainda.
                </p>
              ) : (
                assets.map((asset) => {
                  const daysUntil = getDaysUntilMaintenance(asset.next_maintenance);
                  return (
                    <div
                      key={asset.id}
                      className={`border-2 rounded-lg p-4 ${getStatusColor(asset.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(asset.status)}
                            <h3 className="font-semibold text-lg">{asset.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Categoria: {asset.category}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {asset.last_maintenance && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Última: {new Date(asset.last_maintenance).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                            {asset.next_maintenance && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Próxima: {new Date(asset.next_maintenance).toLocaleDateString('pt-BR')}
                                  {daysUntil !== null && (
                                    <span className="ml-1">
                                      ({daysUntil > 0 ? `em ${daysUntil} dias` : `${Math.abs(daysUntil)} dias atrasada`})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegisterMaintenance(asset.id)}
                          >
                            <Wrench className="w-4 h-4 mr-1" />
                            Registrar Manutenção
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(asset)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(asset.id)}
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

export default Maintenance;
