import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "reseller">("customer");
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success("Conta criada com sucesso!");
      setIsLoading(false);

      // Redirect based on role
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else if (data.user.role === "reseller") {
        setLocation("/dashboard/reseller");
      } else {
        setLocation("/dashboard/customer");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
      setIsLoading(false);
    },
  });

  // If already logged in, redirect
  if (user) {
    if (user.role === "admin") {
      setLocation("/admin");
    } else if (user.role === "reseller") {
      setLocation("/dashboard/reseller");
    } else {
      setLocation("/dashboard/customer");
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword || !name) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    setIsLoading(true);
    registerMutation.mutate({ username, password, name, role });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Voltar</span>
      </button>

      <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold">AT</span>
              </div>
              <h1 className="text-2xl font-bold">AppsTV</h1>
            </div>
            <p className="text-muted-foreground">Crie sua conta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Conta</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as "customer" | "reseller")}>
                <div className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer" className="cursor-pointer flex-1 font-medium">
                    Cliente
                  </Label>
                  <span className="text-xs text-muted-foreground">Ativar códigos</span>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="reseller" id="reseller" />
                  <Label htmlFor="reseller" className="cursor-pointer flex-1 font-medium">
                    Revendedor
                  </Label>
                  <span className="text-xs text-muted-foreground">Gerar códigos</span>
                </div>
              </RadioGroup>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Escolha um usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Já tem conta?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-accent hover:underline font-semibold"
              >
                Faça login aqui
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
