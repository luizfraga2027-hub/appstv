import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, CreditCard, Zap, BarChart3, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedResellerId, setSelectedResellerId] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("");

  // Redirect if not admin
  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStatistics.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery();
  const { data: resellers, isLoading: resellersLoading } = trpc.admin.getAllResellers.useQuery();

  // Add credits mutation
  const addCreditsMutation = trpc.admin.addCreditsToReseller.useMutation({
    onSuccess: () => {
      toast.success("Créditos adicionados com sucesso!");
      setCreditAmount("");
      setSelectedResellerId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar créditos");
    },
  });

  const handleAddCredits = () => {
    if (!selectedResellerId || !creditAmount) {
      toast.error("Selecione um revendedor e insira o valor");
      return;
    }

    addCreditsMutation.mutate({
      resellerId: selectedResellerId,
      amount: parseFloat(creditAmount),
      description: "Adição manual de créditos",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">Gerencie usuários, revendedores e estatísticas</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-accent/50" />
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revendedores</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalResellers || 0}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-accent/50" />
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Clientes</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalCustomers || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-accent/50" />
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Créditos Totais</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalCredits || 0).toFixed(2)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent/50" />
            </div>
          </Card>
        </div>

        {/* Add Credits Section */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Adicionar Créditos a Revendedor</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Selecionar Revendedor</Label>
              <select
                value={selectedResellerId || ""}
                onChange={(e) => setSelectedResellerId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:outline-none focus:border-accent/50"
              >
                <option value="">Escolha um revendedor</option>
                {resellers?.map((reseller) => (
                  <option key={reseller.id} value={reseller.id}>
                    {reseller.companyName} (Saldo: {parseFloat(reseller.creditBalance.toString()).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Valor de Créditos</Label>
              <Input
                type="number"
                placeholder="Digite o valor"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="bg-input border-border/50 focus:border-accent/50"
                min="0"
                step="0.01"
              />
            </div>

            <Button
              onClick={handleAddCredits}
              disabled={addCreditsMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {addCreditsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar Créditos"
              )}
            </Button>
          </div>
        </Card>

        {/* Users List */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Usuários</h2>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold">Usuário</th>
                    <th className="text-left py-3 px-4 font-semibold">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-3 px-4">{u.username}</td>
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                          {u.role === "admin" ? "Admin" : u.role === "reseller" ? "Revendedor" : "Cliente"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            u.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : u.status === "blocked"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {u.status === "active" ? "Ativo" : u.status === "blocked" ? "Bloqueado" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Resellers List */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Revendedores</h2>

          {resellersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold">Empresa</th>
                    <th className="text-left py-3 px-4 font-semibold">Saldo de Créditos</th>
                    <th className="text-left py-3 px-4 font-semibold">Créditos Usados</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resellers?.map((reseller) => (
                    <tr key={reseller.id} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-3 px-4">{reseller.companyName}</td>
                      <td className="py-3 px-4 font-semibold">{parseFloat(reseller.creditBalance.toString()).toFixed(2)}</td>
                      <td className="py-3 px-4">{parseFloat(reseller.totalCreditsUsed.toString()).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            reseller.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : reseller.status === "suspended"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {reseller.status === "active" ? "Ativo" : reseller.status === "suspended" ? "Suspenso" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
