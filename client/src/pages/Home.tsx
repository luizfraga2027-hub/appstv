import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { AlertCircle, Zap, Users, Lock, Smartphone, BarChart3, Shield, Cpu } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      if (user.role === "reseller") setLocation("/dashboard/reseller");
      else if (user.role === "customer") setLocation("/dashboard/customer");
      // Admin users are redirected elsewhere, not shown in public UI
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
              AT
            </div>
            <span className="text-xl font-bold">AppsTV</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = getLoginUrl())}
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
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Legal Notice Banner */}
      <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
        <div className="container flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-semibold">Aviso Importante:</p>
            <p>
              AppsTV é uma plataforma de gerenciamento de acesso. <strong>Você fornece o conteúdo IPTV, nós gerenciamos o acesso.</strong> Não vendemos listas IPTV ou conteúdo de streaming.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient effect */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Controle de Acesso ao <span className="bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent">AppsTV</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Plataforma elegante e segura para gerenciar assinaturas, códigos de ativação e acesso de clientes. Autenticação local, sem dependências externas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/register")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-8 h-12"
              >
                <Zap className="mr-2 h-5 w-5" />
                Criar Conta
              </Button>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                variant="outline"
                size="lg"
                className="border-accent/50 text-foreground hover:bg-accent/10 text-base px-8 h-12"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Recursos Poderosos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar assinaturas IPTV de forma profissional e segura
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "Autenticação JWT",
                description: "Sistema de login seguro com autenticação JWT local, sem OAuth externo",
              },
              {
                icon: Users,
                title: "Hierarquia de Usuários",
                description: "Admin, Revendedor e Cliente com permissões específicas e controladas",
              },
              {
                icon: Zap,
                title: "Códigos de Ativação",
                description: "Geração de códigos com múltiplas durações (30, 90, 180, 365 dias)",
              },
              {
                icon: BarChart3,
                title: "Sistema de Créditos",
                description: "Gerenciamento completo de créditos para revendedores com histórico",
              },
              {
                icon: Smartphone,
                title: "API para Smart TV",
                description: "Validação de códigos e verificação de status para aplicativos",
              },
              {
                icon: Shield,
                title: "100% Independente",
                description: "Sem e-mail, sem Stripe, sem dependências de serviços externos",
              },
              {
                icon: Cpu,
                title: "Banco de Dados Robusto",
                description: "MySQL com schema completo e relacionamentos bem definidos",
              },
              {
                icon: BarChart3,
                title: "Dashboards Personalizados",
                description: "Interfaces específicas para cada tipo de usuário e necessidade",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 border-border/50 hover:border-accent/50 transition-colors group">
                <feature.icon className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/30 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-lg text-muted-foreground">Três passos simples para começar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Registre-se",
                description: "Crie sua conta como Admin, Revendedor ou Cliente com autenticação segura",
              },
              {
                step: "02",
                title: "Gerencie Códigos",
                description: "Gere códigos de ativação com durações personalizadas para seus clientes",
              },
              {
                step: "03",
                title: "Ative Assinaturas",
                description: "Clientes ativam códigos e gerenciam seus dispositivos e assinaturas",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 border-2 border-accent">
                    <span className="text-2xl font-bold text-accent">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-accent to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility Section */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Compatibilidade</h2>
            <p className="text-lg text-muted-foreground">Funciona em qualquer dispositivo</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Samsung TV",
              "LG TV",
              "Android TV",
              "Amazon Fire TV",
              "Google TV",
              "VIDAA OS",
              "WebOS",
              "Aplicativos Customizados",
            ].map((device, i) => (
              <div key={i} className="p-4 border border-border/50 rounded-lg text-center hover:border-accent/50 transition-colors">
                <Smartphone className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="font-medium">{device}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-border/30 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "AppsTV vende listas IPTV?",
                a: "Não. AppsTV é uma plataforma de gerenciamento de acesso. Você fornece suas próprias listas IPTV, e nós gerenciamos o acesso e as assinaturas.",
              },
              {
                q: "Preciso de e-mail para usar?",
                a: "Não. O sistema usa autenticação JWT local com usuário e senha. Sem e-mail, sem OAuth externo.",
              },
              {
                q: "Posso usar com meu próprio conteúdo?",
                a: "Sim. AppsTV é totalmente independente. Você usa suas próprias listas IPTV e conteúdo dentro do aplicativo.",
              },
              {
                q: "Qual é a hierarquia de usuários?",
                a: "Admin (controla tudo), Revendedor (gerencia créditos e códigos) e Cliente (ativa códigos e gerencia dispositivos).",
              },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-border/50 rounded-lg hover:border-accent/50 transition-colors">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Crie sua conta agora e comece a gerenciar suas assinaturas IPTV de forma profissional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/register")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-8 h-12"
              >
                <Zap className="mr-2 h-5 w-5" />
                Criar Conta
              </Button>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                variant="outline"
                size="lg"
                className="border-accent/50 text-foreground hover:bg-accent/10 text-base px-8 h-12"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
                  AT
                </div>
                <span className="font-bold">AppsTV</span>
              </div>
              <p className="text-sm text-muted-foreground">Gerenciamento de acesso IPTV elegante e seguro</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition">Documentação</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Termos</a></li>
                <li><a href="#" className="hover:text-foreground transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition">DMCA</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 AppsTV. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
