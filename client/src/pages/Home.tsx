import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { AlertCircle, Zap, Users, Lock, Smartphone, BarChart3, Shield, Cpu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      if (user.role === "reseller") setLocation("/dashboard/reseller");
      else if (user.role === "customer") setLocation("/dashboard/customer");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-red-900/30 bg-black/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-bold text-lg">
              ⊕
            </div>
            <span className="text-2xl font-bold">AppsTV</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setLocation("/register")}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Cadastro
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section with Forest Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Forest texture background */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='2' /%3E%3C/filter%3E%3Crect width='100' height='100' fill='%23000' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            backgroundColor: '#0a0a0a',
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black -z-10" />

        <div className="container px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-red-600">AppsTV:</span> Onde a Gestão de Acesso
              <br />
              <span className="text-white">Toma o Centro do Palco</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Bem-vindo ao AppsTV, a plataforma de gestão de acesso mais inovadora do mercado. Oferecemos soluções de ponta para gerenciamento centralizado de aplicativos, com tecnologias avançadas de controle de acesso e segurança de dados.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => setLocation("/register")}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 h-14 rounded-lg transition-all transform hover:scale-105"
              >
                Explorar
              </Button>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 h-14 rounded-lg transition-all transform hover:scale-105"
              >
                Become a Reseller
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-900/90 border-t border-red-700 p-4 z-40">
          <div className="container px-4 flex items-start justify-between gap-4">
            <div className="text-sm text-white leading-relaxed flex-1">
              <p className="font-semibold mb-1">⚠️ Aviso Importante</p>
              <p>
                AppsTV é uma plataforma de gerenciamento de acesso e não vende aplicativos ou conteúdo. Você fornece seu próprio conteúdo. AppsTV não é responsável pelo conteúdo utilizado dentro do aplicativo. O aplicativo oferece um período de teste de 7 dias para fins de teste. Após este período, uma licença deve ser adquirida para continuar usando o aplicativo. Aviso: não há reembolso após a compra.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="text-white hover:text-red-300 transition-colors flex-shrink-0 mt-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <section className="py-20 border-t border-red-900/30 bg-black/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Recursos Avançados</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar acesso de forma profissional e segura
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "Segurança Avançada",
                description: "Sistema de login seguro com tecnologia moderna de autenticação e proteção de acesso.",
              },
              {
                icon: Users,
                title: "Gestão de Usuários",
                description: "Admin, revendedores e clientes com permissões organizadas e controladas.",
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
                title: "Plataforma Independente",
                description: "Sistema autônomo sem dependência de serviços externos.",
              },
              {
                icon: Cpu,
                title: "Alta Performance",
                description: "Infraestrutura otimizada para estabilidade, velocidade e segurança dos dados.",
              },
              {
                icon: BarChart3,
                title: "Dashboards Personalizados",
                description: "Interfaces específicas para cada tipo de usuário e necessidade",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 bg-gray-900/50 border-red-900/30 hover:border-red-600/50 transition-all hover:bg-gray-800/50 group">
                <feature.icon className="h-8 w-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-red-900/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-400">Três passos simples para começar</p>
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
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20 border-2 border-red-600">
                    <span className="text-2xl font-bold text-red-600">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-red-600 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-red-900/30 bg-black/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "AppsTV vende listas ou conteúdo?",
                a: "Não. AppsTV é uma plataforma de gerenciamento de acesso e assinaturas somente para aplicativos.",
              },
              {
                q: "Como funciona o acesso ao sistema?",
                a: "A plataforma foi projetada para oferecer login rápido, seguro e confiável com autenticação local.",
              },
              {
                q: "Posso usar com meu próprio conteúdo?",
                a: "Sim. A plataforma é totalmente independente e pode ser utilizada para gerenciar acesso a diferentes tipos de aplicativos e conteúdos.",
              },
              {
                q: "Posso gerenciar vários aplicativos?",
                a: "Sim. A plataforma permite gerenciar múltiplos aplicativos e controlar acessos de forma centralizada.",
              },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-gray-900/50 border border-red-900/30 rounded-lg hover:border-red-600/50 transition-colors">
                <h3 className="font-semibold text-lg text-red-600 mb-3">{item.q}</h3>
                <p className="text-gray-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-red-900/30 bg-black py-12">
        <div className="container px-4 text-center text-gray-500">
          <p className="mb-2">© 2026 AppsTV. Todos os direitos reservados.</p>
          <p className="text-sm">Plataforma de Gerenciamento de Acesso - Desenvolvido com ❤️</p>
        </div>
      </footer>
    </div>
  );
}
