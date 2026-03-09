import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Check } from "lucide-react";

export default function ResellerIptvPage() {
  const [iptvUrl, setIptvUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getListQuery = trpc.iptv.getResellerList.useQuery();
  const updateListMutation = trpc.iptv.updateResellerList.useMutation({
    onSuccess: () => {
      toast.success("Lista IPTV atualizada com sucesso!");
      setIptvUrl("");
      getListQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar lista IPTV");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!iptvUrl.trim()) {
      toast.error("Informe a URL da lista IPTV");
      return;
    }

    try {
      new URL(iptvUrl);
    } catch {
      toast.error("URL inválida. Informe uma URL válida (ex: https://...)");
      return;
    }

    setIsLoading(true);
    updateListMutation.mutate({ iptvListUrl: iptvUrl });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Lista IPTV</h1>
        <p className="text-muted-foreground mt-2">
          Configure a URL da sua lista IPTV (M3U) que será enviada aos clientes
        </p>
      </div>

      {/* Current List */}
      {getListQuery.data?.iptvListUrl && (
        <Card className="border-border/50 bg-accent/5 p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Lista IPTV Atual</h3>
              <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border/50">
                <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <code className="text-sm break-all text-muted-foreground">
                  {getListQuery.data.iptvListUrl}
                </code>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Update Form */}
      <Card className="border-border/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="iptvUrl" className="text-sm font-medium">
              URL da Lista IPTV
            </Label>
            <Input
              id="iptvUrl"
              type="url"
              placeholder="https://exemplo.com/lista.m3u"
              value={iptvUrl}
              onChange={(e) => setIptvUrl(e.target.value)}
              disabled={isLoading}
              className="bg-input border-border/50 focus:border-accent/50"
            />
            <p className="text-xs text-muted-foreground">
              Informe a URL completa da sua lista IPTV (M3U, M3U8 ou similar)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar Lista IPTV"
            )}
          </Button>
        </form>
      </Card>

      {/* Info */}
      <Card className="border-border/50 bg-muted/50 p-6">
        <h3 className="font-semibold mb-3">Informações Importantes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• A URL deve ser acessível publicamente</li>
          <li>• Formatos suportados: M3U, M3U8</li>
          <li>• Esta lista será enviada aos seus clientes quando ativarem um código</li>
          <li>• Você pode atualizar a URL a qualquer momento</li>
        </ul>
      </Card>
    </div>
  );
}
