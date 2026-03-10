import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Edit2, Trash2, Plus } from "lucide-react";

export default function ResellerIptvPage() {
  const [, setLocation] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingList, setEditingList] = useState("");

  // Form state
  const [macId, setMacId] = useState("");
  const [clientName, setClientName] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [iptvListUrl, setIptvListUrl] = useState("");
  const [dns1, setDns1] = useState("");
  const [dns2, setDns2] = useState("");
  const [dns3, setDns3] = useState("");

  // Fetch data
  const { data: macs, isLoading: macsLoading, refetch: refetchMacs } = trpc.mac.listByReseller.useQuery();
  const { data: apps, isLoading: appsLoading } = trpc.applications.listApps.useQuery();

  // Mutations
  const createMacMutation = trpc.mac.activateMac.useMutation({
    onSuccess: () => {
      toast.success("MAC ID ativado com sucesso! 1 crédito foi debitado.");
      resetForm();
      refetchMacs();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao ativar MAC ID");
    },
  });

  const updateListMutation = trpc.mac.updateIptvList.useMutation({
    onSuccess: () => {
      toast.success("Lista IPTV atualizada com sucesso!");
      setEditingId(null);
      refetchMacs();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar lista");
    },
  });

  const deleteMacMutation = trpc.mac.deleteMac.useMutation({
    onSuccess: () => {
      toast.success("MAC ID deletado com sucesso!");
      refetchMacs();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar MAC ID");
    },
  });

  const resetForm = () => {
    setMacId("");
    setClientName("");
    setApplicationId("");
    setIptvListUrl("");
    setDns1("");
    setDns2("");
    setDns3("");
  };

  const handleCreateMac = async () => {
    if (!macId || !clientName || !applicationId) {
      toast.error("Preencha os campos obrigatórios: MAC ID, Nome do Cliente e Aplicativo");
      return;
    }

    createMacMutation.mutate({
      macId,
      clientName,
      applicationId: parseInt(applicationId),
      iptvListUrl: iptvListUrl || undefined,
      dns1: dns1 || undefined,
      dns2: dns2 || undefined,
      dns3: dns3 || undefined,
    });
  };

  const handleUpdateList = (id: number) => {
    if (!editingList) {
      toast.error("Digite a URL da lista IPTV");
      return;
    }

    updateListMutation.mutate({
      macId: macs?.find((m: any) => m.id === id)?.macId || "",
      iptvListUrl: editingList,
    });
  };

  const handleDeleteMac = (macId: string) => {
    if (confirm("Tem certeza que deseja deletar este MAC ID?")) {
      deleteMacMutation.mutate({ macId });
    }
  };

  if (macsLoading || appsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar MAC IDs</h1>
          <p className="text-muted-foreground mt-2">
            Cadastre e gerencie MAC IDs com listas IPTV
          </p>
        </div>
        <Button
          onClick={() => setLocation("/dashboard/reseller")}
          variant="outline"
        >
          Voltar
        </Button>
      </div>

      {/* Create MAC Form */}
      <Card className="p-6 border-border/50">
        <h2 className="text-xl font-semibold mb-4">Novo MAC ID</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>MAC ID *</Label>
            <Input
              placeholder="Ex: 00:1A:2B:3C:4D:5E"
              value={macId}
              onChange={(e) => setMacId(e.target.value)}
            />
          </div>
          <div>
            <Label>Nome do Cliente *</Label>
            <Input
              placeholder="Ex: João Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div>
            <Label>Aplicativo *</Label>
            <Select value={applicationId} onValueChange={setApplicationId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aplicativo" />
              </SelectTrigger>
              <SelectContent>
                {apps?.map((app: any) => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    {app.name} v{app.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lista IPTV (M3U)</Label>
            <Input
              placeholder="https://..."
              value={iptvListUrl}
              onChange={(e) => setIptvListUrl(e.target.value)}
            />
          </div>
          <div>
            <Label>DNS 1</Label>
            <Input
              placeholder="8.8.8.8"
              value={dns1}
              onChange={(e) => setDns1(e.target.value)}
            />
          </div>
          <div>
            <Label>DNS 2</Label>
            <Input
              placeholder="8.8.4.4"
              value={dns2}
              onChange={(e) => setDns2(e.target.value)}
            />
          </div>
          <div>
            <Label>DNS 3</Label>
            <Input
              placeholder="1.1.1.1"
              value={dns3}
              onChange={(e) => setDns3(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleCreateMac}
            disabled={createMacMutation.isPending}
            className="bg-accent hover:bg-accent/90"
          >
            {createMacMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ativando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Ativar MAC ID (1 crédito)
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline">
            Limpar
          </Button>
        </div>
      </Card>

      {/* MAC IDs Table */}
      <Card className="p-6 border-border/50">
        <h2 className="text-xl font-semibold mb-4">Meus MAC IDs</h2>
        {macs && macs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAC ID</TableHead>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>Aplicativo</TableHead>
                  <TableHead>Lista IPTV</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {macs.map((mac: any) => (
                  <TableRow key={mac.id}>
                    <TableCell className="font-mono text-sm">{mac.macId}</TableCell>
                    <TableCell>{mac.clientName}</TableCell>
                    <TableCell>{mac.applicationId}</TableCell>
                    <TableCell>
                      {mac.iptvListUrl ? (
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {mac.iptvListUrl}
                        </span>
                      ) : (
                        <span className="text-xs text-destructive">Não configurada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          mac.status === "active"
                            ? "bg-green-900/20 text-green-400"
                            : mac.status === "expired"
                            ? "bg-red-900/20 text-red-400"
                            : "bg-gray-900/20 text-gray-400"
                        }`}
                      >
                        {mac.status === "active" ? "Ativo" : mac.status === "expired" ? "Expirado" : "Bloqueado"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(mac.expirationDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingList(mac.iptvListUrl || "")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Lista IPTV</DialogTitle>
                              <DialogDescription>
                                MAC ID: {mac.macId}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>URL da Lista M3U</Label>
                                <Input
                                  value={editingList}
                                  onChange={(e) => setEditingList(e.target.value)}
                                  placeholder="https://..."
                                />
                              </div>
                              <Button
                                onClick={() => handleUpdateList(mac.id)}
                                disabled={updateListMutation.isPending}
                                className="w-full bg-accent hover:bg-accent/90"
                              >
                                {updateListMutation.isPending ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMac(mac.macId)}
                          disabled={deleteMacMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum MAC ID cadastrado ainda. Crie um novo acima!
          </div>
        )}
      </Card>
    </div>
  );
}
