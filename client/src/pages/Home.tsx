import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronRight, Shield, Zap, Users, Lock, BarChart3 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "admin") {
      setLocation("/admin");
    } else if (user.role === "reseller") {
      setLocation("/dashboard/reseller");
    } else {
      setLocation("/dashboard/customer");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">AT</span>
            </div>
            <span className="font-bold text-lg">AppsTV</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="text-foreground hover:bg-accent/10"
            >
              Login
            </Button>
            <Button
              onClick={() => setLocation("/register")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Cadastro
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <span className="text-sm font-semibold text-accent">Plataforma SaaS Profissional</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Controle de Acesso ao AppsTV
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Plataforma elegante e segura para gerenciar assinaturas e códigos de ativação.
            <br />
            <span className="font-semibold text-foreground">Você fornece o conteúdo IPTV, nós gerenciamos o acesso.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => setLocation("/register")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-base"
            >
              Começar Agora <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/login")}
              className="border-border hover:bg-accent/5 text-base"
            >
              Já tem conta?
            </Button>
          </div>

          {/* Important Notice */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mb-12">
            <p className="text-sm font-semibold text-accent mb-2">⚠️ Aviso Importante</p>
            <p className="text-foreground">
              <strong>AppsTV não vende listas IPTV ou conteúdo de streaming.</strong> Você utiliza suas próprias listas IPTV dentro do aplicativo.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/50 border-t border-border/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Funcionalidades Principais</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Autenticação Segura</h3>
              <p className="text-muted-foreground">
                Sistema de autenticação local com JWT. Sem dependências externas, totalmente independente.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Códigos de Ativação</h3>
              <p className="text-muted-foreground">
                Gere códigos com durações variáveis (30, 90, 180, 365 dias) e distribua para seus clientes.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hierarquia de Usuários</h3>
              <p className="text-muted-foreground">
                Admin, Revendedor e Cliente com permissões específicas e dashboards personalizados.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Estatísticas em Tempo Real</h3>
              <p className="text-muted-foreground">
                Acompanhe créditos, ativações, clientes e receita em dashboards intuitivos.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">API para Smart TV</h3>
              <p className="text-muted-foreground">
                Integre com seu aplicativo Smart TV para validar códigos e verificar assinaturas.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Independente</h3>
              <p className="text-muted-foreground">
                Sem OAuth externo, sem e-mail, sem Stripe. Tudo gerenciado internamente.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Como Funciona</h2>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Crie sua Conta</h3>
              <p className="text-muted-foreground">
                Registre-se como Revendedor ou Cliente. Sem necessidade de e-mail ou verificação externa.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Gere Códigos de Ativação</h3>
              <p className="text-muted-foreground">
                Como Revendedor, gere códigos com durações variáveis e distribua para seus clientes.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Ative no Aplicativo</h3>
              <p className="text-muted-foreground">
                Clientes inserem o código no aplicativo AppsTV para liberar acesso por 1 ano.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Adicione sua Lista IPTV</h3>
              <p className="text-muted-foreground">
                Clientes adicionam suas próprias listas IPTV no aplicativo e começam a assistir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent/10 border-t border-border/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Crie sua conta agora e comece a gerenciar suas assinaturas.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/register")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-base"
          >
            Cadastre-se Agora <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 AppsTV. Todos os direitos reservados.</p>
          <p className="mt-2">
            <strong>Aviso:</strong> AppsTV não vende conteúdo IPTV. Você fornece o conteúdo, nós gerenciamos o acesso.
          </p>
        </div>
      </footer>
    </div>
  );
}
