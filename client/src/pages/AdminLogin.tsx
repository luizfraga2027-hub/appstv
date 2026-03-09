import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Lock, AlertCircle } from "lucide-react";

/**
 * Exclusive Admin Login Page
 * This page is NOT linked from anywhere in the public UI
 * Access only through direct URL: /admin/login
 * Only administrators can access the admin dashboard
 */
export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.user.role === "admin") {
        toast.success("Login de administrador realizado com sucesso!");
        setLocation("/admin");
      } else {
        toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
        setUsername("");
        setPassword("");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
      setPassword("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    loginMutation.mutate({ username, password });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
            AT
          </div>
          <span className="text-2xl font-bold">AppsTV</span>
        </div>

        {/* Card */}
        <Card className="p-8 border-border/50">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="h-6 w-6 text-accent" />
              <h1 className="text-2xl font-bold">Acesso Administrativo</h1>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Página exclusiva para administradores do sistema
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold mb-1">Aviso de Segurança</p>
              <p>Esta página é exclusiva para administradores. Acesso não autorizado é proibido.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium mb-2 block">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || loginMutation.isPending}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || loginMutation.isPending}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || loginMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-10"
            >
              {isLoading || loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Acessar Painel Admin
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
            <p>Apenas administradores podem acessar esta página.</p>
            <p className="mt-2">Todas as tentativas de acesso são registradas.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
