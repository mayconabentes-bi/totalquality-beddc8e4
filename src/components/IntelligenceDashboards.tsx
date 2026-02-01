import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface RevenueQualityData {
  paymentStatus: string;
  planType: string;
  paymentMethod: string;
  count: number;
}

interface NeighborhoodData {
  neighborhood: string;
  active: number;
  cancelled: number;
  total: number;
}

interface ConversionFunnelData {
  stage: string;
  count: number;
}

interface Props {
  companyId: string;
}

const COLORS = {
  primary: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  green: ['#22c55e', '#4ade80', '#86efac'],
  red: ['#ef4444', '#f87171', '#fca5a5'],
  status: {
    Adimplente: '#22c55e',
    Inadimplente: '#ef4444'
  }
};

const IntelligenceDashboards = ({ companyId }: Props) => {
  const [revenueData, setRevenueData] = useState<RevenueQualityData[]>([]);
  const [neighborhoodData, setNeighborhoodData] = useState<NeighborhoodData[]>([]);
  const [conversionData, setConversionData] = useState<ConversionFunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchDashboardData();
    }
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchRevenueQualityData(),
        fetchGeoDemographicData(),
        fetchConversionFunnelData()
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueQualityData = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("current_payment_status, current_plan, current_payment_method")
      .eq("company_id", companyId)
      .eq("status", "Ativo");

    if (!error && data) {
      // Group data for visualization
      const grouped: Record<string, RevenueQualityData> = {};
      
      data.forEach((student) => {
        const key = `${student.current_payment_status || 'Não Definido'}-${student.current_plan || 'Não Definido'}-${student.current_payment_method || 'Não Definido'}`;
        if (!grouped[key]) {
          grouped[key] = {
            paymentStatus: student.current_payment_status || 'Não Definido',
            planType: student.current_plan || 'Não Definido',
            paymentMethod: student.current_payment_method || 'Não Definido',
            count: 0
          };
        }
        grouped[key].count++;
      });

      setRevenueData(Object.values(grouped));
    }
  };

  const fetchGeoDemographicData = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("neighborhood, status")
      .eq("company_id", companyId)
      .not("neighborhood", "is", null);

    if (!error && data) {
      // Group by neighborhood
      const grouped: Record<string, { active: number; cancelled: number }> = {};
      
      data.forEach((student) => {
        const neighborhood = student.neighborhood || 'Não Informado';
        if (!grouped[neighborhood]) {
          grouped[neighborhood] = { active: 0, cancelled: 0 };
        }
        if (student.status === 'Ativo') {
          grouped[neighborhood].active++;
        } else if (student.status === 'Cancelado') {
          grouped[neighborhood].cancelled++;
        }
      });

      const neighborhoodArray = Object.entries(grouped)
        .map(([neighborhood, counts]) => ({
          neighborhood,
          active: counts.active,
          cancelled: counts.cancelled,
          total: counts.active + counts.cancelled
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // Top 10 neighborhoods

      setNeighborhoodData(neighborhoodArray);
    }
  };

  const fetchConversionFunnelData = async () => {
    // Fetch visits data
    const { data: visitsData, error: visitsError } = await supabase
      .from("student_flow")
      .select("*")
      .eq("company_id", companyId);

    // Fetch active students
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("id")
      .eq("company_id", companyId)
      .eq("status", "Ativo");

    if (!visitsError && !studentsError && visitsData && studentsData) {
      const totalVisits = visitsData.length;
      const scheduledVisits = visitsData.filter(v => v.visit_type === 'Visita com Aula Agendada').length;
      const convertedVisits = visitsData.filter(v => v.converted_to_student).length;
      const activeStudents = studentsData.length;

      setConversionData([
        { stage: 'Total de Visitas', count: totalVisits },
        { stage: 'Visitas Agendadas', count: scheduledVisits },
        { stage: 'Matrículas', count: convertedVisits },
        { stage: 'Alunos Ativos', count: activeStudents }
      ]);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for nested pie chart (Revenue Quality)
  const revenueChartData = revenueData.map((item) => ({
    name: `${item.paymentStatus} - ${item.planType}`,
    value: item.count,
    fill: item.paymentStatus === 'Adimplente' ? COLORS.green[0] : COLORS.red[0]
  }));

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold">Dashboards de Inteligência</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Quality Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Qualidade de Receita</CardTitle>
            <CardDescription>
              Status de Pagamento × Tipo de Plano × Método de Pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível. Cadastre alunos com informações financeiras.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geodemographic Radar (Bar Chart by Neighborhood) */}
        <Card>
          <CardHeader>
            <CardTitle>Radar Geodemográfico</CardTitle>
            <CardDescription>
              Concentração de Alunos por Bairro (Ativos vs. Cancelados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {neighborhoodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={neighborhoodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="neighborhood" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill={COLORS.green[0]} name="Ativos" />
                  <Bar dataKey="cancelled" fill={COLORS.red[0]} name="Cancelados" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível. Cadastre alunos com informação de bairro.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Visitantes Agendados vs. Matrículas Realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={COLORS.primary[0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível. Registre visitas para visualizar o funil.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntelligenceDashboards;
