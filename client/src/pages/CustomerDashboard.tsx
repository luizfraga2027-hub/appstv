import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Zap, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activationCode, setActivationCode] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");

  // Redirect if not customer
  if (user?.role !== "customer" && user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  // Fetch customer data
  const { data: subscriptions, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = trpc.customer.getSubscriptions.useQuery();
  const { data: activeSubscription, isLoading: activeSubLoading } = trpc.customer.getActiveSubscription.useQuery();
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = trpc.customer.getDevices.useQuery();

  // Activate code mutation
  const activateCodeMutation = trpc.customer.activateCode.useMutation({
    onSuccess: () => {
      toast.success("Código ativado com sucesso!");
      setActivationCode("");
      refetchSubscriptions();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao ativar código");
    },
  });

  // Register device mutation
  const registerDeviceMutation = trpc.customer.registerDevice.useMutation({
    onSuccess: () => {
      toast.success("Dispositivo registrado com sucesso!");
      setDeviceId("");
      setDeviceName("");
      refetchDevices();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar dispositivo");
    },
  });

  const handleActivateCode = () => {
    if (!activationCode.trim()) {
      toast.error("Digite um código de ativação");
      return;
    }

    activateCodeMutation.mutate({ code: activationCode });
  };

  const handleRegisterDevice = () => {
    if (!deviceId.trim() || !deviceName.trim()) {
      toast.error("Preencha o ID e nome do dispositivo");
      return;
    }

    registerDeviceMutation.mutate({ deviceId, deviceName });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Minha Assinatura</h1>
          <p className="text-muted-foreground mt-2">Gerencie sua assinatura e dispositivos</p>
        </div>

        {/* Active Subscription Card */}
        {activeSubLoading ? (
          <Card className="p-6 border-border/50 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </Card>
        ) : activeSubscription ? (
          <Card className="p-6 border-border/50 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Assinatura Ativa</h2>
                <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-semibold">
                  Ativo
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
                  <p className="font-semibold">
                    {new Date(activeSubscription.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Expiração</p>
                  <p className="font-semibold">
                    {new Date(activeSubscription.expirationDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dias Restantes</p>
                  <p className="font-semibold">
                    {Math.ceil(
                      (new Date(activeSubscription.expirationDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    dias
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-border/50 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <p className="text-center text-muted-foreground">Você não possui uma assinatura ativa. Ative um código abaixo.</p>
          </Card>
        )}

        {/* Activate Code Section */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Ativar Código de Ativação</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Código de Ativação</Label>
              <Input
                type="text"
                placeholder="Digite seu código"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                className="bg-input border-border/50 focus:border-accent/50 font-mono"
              />
            </div>

            <Button
              onClick={handleActivateCode}
              disabled={activateCodeMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {activateCodeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ativando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Ativar Código
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Register Device Section */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Registrar Dispositivo</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">ID do Dispositivo</Label>
              <Input
                type="text"
                placeholder="Ex: DEVICE_123456"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="bg-input border-border/50 focus:border-accent/50 font-mono"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Nome do Dispositivo</Label>
              <Input
                type="text"
                placeholder="Ex: Sala de TV"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            <Button
              onClick={handleRegisterDevice}
              disabled={registerDeviceMutation.isPending || !activeSubscription}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {registerDeviceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Registrar Dispositivo
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Devices List */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Meus Dispositivos</h2>

          {devicesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : devices && devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Smartphone className="h-5 w-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold">{device.deviceName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{device.deviceId}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Registrado em {new Date(device.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum dispositivo registrado</p>
          )}
        </Card>

        {/* Subscriptions History */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Histórico de Assinaturas</h2>

          {subscriptionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold">Início</th>
                    <th className="text-left py-3 px-4 font-semibold">Expiração</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-3 px-4">{new Date(sub.startDate).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4">{new Date(sub.expirationDate).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            sub.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : sub.status === "expired"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-gray-500/10 text-gray-600"
                          }`}
                        >
                          {sub.status === "active" ? "Ativo" : sub.status === "expired" ? "Expirado" : "Cancelado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma assinatura registrada</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
