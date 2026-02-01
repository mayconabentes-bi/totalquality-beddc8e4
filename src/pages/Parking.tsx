import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, LogOut, Car, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ParkingLog {
  id: string;
  student_name: string;
  license_plate: string;
  entry_time: string;
  exit_time: string | null;
  status: 'Entrada' | 'Saída';
}

interface Student {
  id: string;
  name: string;
}

const PARKING_CAPACITY = 30; // Configurable parking capacity

const Parking = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string>("");
  const [parkingLogs, setParkingLogs] = useState<ParkingLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Entry form state
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({
    student_name: "",
    license_plate: "",
  });

  // Exit form state
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitSearchTerm, setExitSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
    // Set up real-time subscription for parking logs
    const subscription = supabase
      .channel('parking_logs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parking_logs' },
        () => {
          // Refetch data when changes occur
          fetchParkingLogs(companyId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
          fetchParkingLogs(profile.company_id),
          fetchStudents(profile.company_id)
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParkingLogs = async (compId: string) => {
    const { data, error } = await supabase
      .from("parking_logs")
      .select("*")
      .eq("company_id", compId)
      .eq("status", "Entrada")
      .order("entry_time", { ascending: false });

    if (!error && data) {
      setParkingLogs(data);
    }
  };

  const fetchStudents = async (compId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name")
      .eq("company_id", compId)
      .eq("status", "Ativo")
      .order("name");

    if (!error && data) {
      setStudents(data);
    }
  };

  const handleRegisterEntry = async () => {
    if (!entryForm.student_name || !entryForm.license_plate) {
      toast.error("Nome e placa são obrigatórios");
      return;
    }

    const { error } = await supabase.from("parking_logs").insert({
      company_id: companyId,
      student_name: entryForm.student_name,
      license_plate: entryForm.license_plate.toUpperCase(),
      status: "Entrada"
    });

    if (error) {
      toast.error("Erro ao registrar entrada");
      console.error(error);
    } else {
      toast.success("Entrada registrada com sucesso!");
      setEntryForm({ student_name: "", license_plate: "" });
      setEntryDialogOpen(false);
      fetchParkingLogs(companyId);
    }
  };

  const handleRegisterExit = async (logId: string) => {
    const { error } = await supabase
      .from("parking_logs")
      .update({ 
        status: "Saída",
        exit_time: new Date().toISOString()
      })
      .eq("id", logId);

    if (error) {
      toast.error("Erro ao registrar saída");
      console.error(error);
    } else {
      toast.success("Saída registrada com sucesso!");
      fetchParkingLogs(companyId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredLogs = parkingLogs.filter(log => 
    log.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const occupancyPercentage = Math.round((parkingLogs.length / PARKING_CAPACITY) * 100);
  const occupancyColor = occupancyPercentage > 90 ? "bg-red-500" : occupancyPercentage > 70 ? "bg-yellow-500" : "bg-green-500";

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
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Estacionamento - Total<span className="gradient-text">Quality</span>
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Occupancy Indicator */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ocupação do Estacionamento</span>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {parkingLogs.length} / {PARKING_CAPACITY} vagas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
              <div 
                className={`h-full ${occupancyColor} transition-all duration-500 flex items-center justify-center text-white font-bold text-sm`}
                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
              >
                {occupancyPercentage}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-24 text-xl">
                <ArrowUpCircle className="w-8 h-8 mr-3" />
                Registrar Entrada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Entrada de Veículo</DialogTitle>
                <DialogDescription>Preencha os dados do veículo que está entrando</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student_name">Nome do Aluno *</Label>
                  <Input
                    id="student_name"
                    placeholder="Digite o nome do aluno"
                    value={entryForm.student_name}
                    onChange={(e) => setEntryForm({ ...entryForm, student_name: e.target.value })}
                    list="students-list"
                  />
                  <datalist id="students-list">
                    {students.map((student) => (
                      <option key={student.id} value={student.name} />
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="license_plate">Placa do Veículo *</Label>
                  <Input
                    id="license_plate"
                    placeholder="ABC-1234"
                    value={entryForm.license_plate}
                    onChange={(e) => setEntryForm({ ...entryForm, license_plate: e.target.value })}
                    className="uppercase"
                  />
                </div>
              </div>
              <Button onClick={handleRegisterEntry} className="w-full">
                Confirmar Entrada
              </Button>
            </DialogContent>
          </Dialog>

          <Button size="lg" variant="secondary" className="h-24 text-xl" onClick={() => setExitDialogOpen(true)}>
            <ArrowDownCircle className="w-8 h-8 mr-3" />
            Registrar Saída
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Vehicles in Parking Lot */}
        <Card>
          <CardHeader>
            <CardTitle>Veículos no Pátio</CardTitle>
            <CardDescription>Lista em tempo real de veículos estacionados</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Aluno</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {log.license_plate}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(log.entry_time).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRegisterExit(log.id)}
                        >
                          <ArrowDownCircle className="w-4 h-4 mr-2" />
                          Registrar Saída
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "Nenhum veículo encontrado com esse critério" : "Nenhum veículo no pátio no momento"}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Parking;
