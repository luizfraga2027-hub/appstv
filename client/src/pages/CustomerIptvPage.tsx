import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Check, Copy } from "lucide-react";

export default function CustomerIptvPage() {
  const [iptvUrl, setIptvUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getListQuery = trpc.iptv.getCustomerList.useQuery();
  const updateListMutation = trpc.iptv.updateCustomerList.useMutation({
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

  const handleCopy = () => {
    if (getListQuery.data?.iptvListUrl) {
      navigator.clipboard.writeText(getListQuery.data.iptvListUrl);
      toast.success("URL copiada para a área de transferência!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Minha Lista IPTV</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie a URL da sua lista IPTV para usar em seus dispositivos
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
              <h3 className="font-semibold mb-2">Lista IPTV Configurada</h3>
              <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border/50">
                <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <code className="text-sm break-all text-muted-foreground flex-1">
                  {getListQuery.data.iptvListUrl}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!getListQuery.data?.iptvListUrl && (
        <Card className="border-border/50 bg-muted/50 p-6">
          <p className="text-sm text-muted-foreground">
            Nenhuma lista IPTV configurada. Configure uma URL abaixo.
          </p>
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
        <h3 className="font-semibold mb-3">Como Usar</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Configure a URL da sua lista IPTV acima</li>
          <li>Use a URL em seus aplicativos Smart TV ou players IPTV</li>
          <li>Você pode atualizar a URL a qualquer momento</li>
          <li>Clique no ícone de cópia para copiar a URL rapidamente</li>
        </ol>
      </Card>
    </div>
  );
}
