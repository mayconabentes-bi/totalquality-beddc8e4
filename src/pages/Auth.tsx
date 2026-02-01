import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, ArrowLeft, Loader2, Building2, User, Mail, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100),
  companyName: z.string().trim().min(2, { message: "Nome da empresa deve ter no mínimo 2 caracteres" }).max(100),
  phone: z.string().trim().optional(),
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

type AuthMode = "login" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("empresa");

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const clearErrors = () => setErrors({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Email ou senha incorretos");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Por favor, confirme seu email antes de fazer login");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/dashboard");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = signupSchema.safeParse({ 
      fullName, 
      companyName, 
      phone, 
      email, 
      password 
    });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
        }
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        toast.error("Este email já está cadastrado. Faça login ou use outro email.");
      } else {
        toast.error(authError.message);
      }
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create company record
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          user_id: authData.user.id,
          name: companyName.trim(),
          phone: phone.trim() || null,
        })
        .select()
        .single();

      if (companyError) {
        console.error("Error creating company:", companyError);
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          full_name: fullName.trim(),
          company_id: companyData?.id || null,
          role: selectedRole,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
      setMode("login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Button>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-strong p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-soft">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              Total<span className="gradient-text">Quality</span>
            </span>
          </div>

          {/* Mode Switch */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode("signup"); clearErrors(); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "signup" 
                  ? "bg-card shadow-soft text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cadastrar
            </button>
            <button
              onClick={() => { setMode("login"); clearErrors(); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "login" 
                  ? "bg-card shadow-soft text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
          </div>

          {mode === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Seu Nome Completo
                </Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Nome da Empresa
                </Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Sua Empresa Ltda"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`pl-10 ${errors.companyName ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Modalidade <span className="text-destructive">*</span>
                </Label>
                <RadioGroup 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="empresa" id="empresa" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="empresa" className="text-sm font-semibold cursor-pointer">
                        Empresa (Cliente)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Empresas que buscam certificações ISO e auditoria de qualidade
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="auditor" id="auditor" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="auditor" className="text-sm font-semibold cursor-pointer">
                        Auditor
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Profissionais responsáveis por realizar auditorias e avaliações
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="totalquality" id="totalquality" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="totalquality" className="text-sm font-semibold cursor-pointer">
                        Total Quality ISO
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Administradores da plataforma Total Quality ISO
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-bg font-semibold h-12 shadow-soft hover:shadow-medium transition-shadow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Começar Teste Grátis"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Ao cadastrar, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="loginEmail" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="joao@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="loginPassword" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-bg font-semibold h-12 shadow-soft hover:shadow-medium transition-shadow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="text-center">
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ✓ 14 dias grátis &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Cancele quando quiser
        </p>
      </div>
    </div>
  );
};

export default Auth;
