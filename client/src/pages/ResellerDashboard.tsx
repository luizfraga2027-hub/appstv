import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CreditCard, Zap, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ResellerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState("10");
  const [duration, setDuration] = useState<"30" | "90" | "180" | "365">("365");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Redirect if not reseller
  if (user?.role !== "reseller" && user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  // Fetch reseller data
  const { data: profile, isLoading: profileLoading } = trpc.reseller.getProfile.useQuery();
  const { data: credits, isLoading: creditsLoading } = trpc.reseller.getCredits.useQuery();
  const { data: codes, isLoading: codesLoading, refetch: refetchCodes } = trpc.reseller.listCodes.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.reseller.getTransactions.useQuery();

  // Generate codes mutation
  const generateCodesMutation = trpc.reseller.generateCodes.useMutation({
    onSuccess: () => {
      toast.success(`${quantity} código(s) gerado(s) com sucesso!`);
      setQuantity("10");
      refetchCodes();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar códigos");
    },
  });

  const handleGenerateCodes = () => {
    if (!quantity || parseInt(quantity) < 1 || parseInt(quantity) > 100) {
      toast.error("Digite uma quantidade entre 1 e 100");
      return;
    }

    generateCodesMutation.mutate({
      quantity: parseInt(quantity),
      durationDays: duration,
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success("Código copiado!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard do Revendedor</h1>
            <p className="text-muted-foreground mt-2">Gerencie seus créditos e códigos de ativação</p>
          </div>
          <Button
            onClick={() => setLocation("/dashboard/reseller/iptv")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Gerenciar Lista IPTV
          </Button>
        </div>

        {/* Credits Card */}
        <Card className="p-6 border-border/50 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Saldo de Créditos</p>
              <p className="text-4xl font-bold">
                {creditsLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : credits?.creditBalance || "0.00"}
              </p>
            </div>
            <CreditCard className="h-12 w-12 text-accent/50" />
          </div>
        </Card>

        {/* Generate Codes Section */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Gerar Códigos de Ativação</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Quantidade</Label>
              <Input
                type="number"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max="100"
                className="bg-input border-border/50 focus:border-accent/50"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Duração</Label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as "30" | "90" | "180" | "365")}
                className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:outline-none focus:border-accent/50"
              >
                <option value="30">30 dias</option>
                <option value="90">90 dias</option>
                <option value="180">180 dias</option>
                <option value="365">365 dias (1 ano)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateCodes}
                disabled={generateCodesMutation.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {generateCodesMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Gerar
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Codes List */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Seus Códigos</h2>

          {codesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : codes && codes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold">Código</th>
                    <th className="text-left py-3 px-4 font-semibold">Duração</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Criado em</th>
                    <th className="text-left py-3 px-4 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-3 px-4 font-mono font-semibold">{code.code}</td>
                      <td className="py-3 px-4">{code.durationDays} dias</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            code.status === "available"
                              ? "bg-green-500/10 text-green-600"
                              : code.status === "activated"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-gray-500/10 text-gray-600"
                          }`}
                        >
                          {code.status === "available" ? "Disponível" : code.status === "activated" ? "Ativado" : "Expirado"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(code.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(code.code)}
                          className="text-accent hover:bg-accent/10"
                        >
                          {copiedCode === code.code ? "Copiado!" : <Copy className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum código gerado ainda</p>
          )}
        </Card>

        {/* Transactions */}
        <Card className="p-6 border-border/50">
          <h2 className="text-xl font-bold mb-6">Histórico de Transações</h2>

          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold">Valor</th>
                    <th className="text-left py-3 px-4 font-semibold">Descrição</th>
                    <th className="text-left py-3 px-4 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.type === "purchase"
                              ? "bg-green-500/10 text-green-600"
                              : tx.type === "distribution"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {tx.type === "purchase" ? "Compra" : tx.type === "distribution" ? "Distribuição" : "Reembolso"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{parseFloat(tx.amount.toString()).toFixed(2)}</td>
                      <td className="py-3 px-4">{tx.description || "-"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma transação registrada</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
