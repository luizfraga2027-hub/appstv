import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, CreditCard, Zap, BarChart3, Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedResellerId, setSelectedResellerId] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "resellers" | "customers" | "apps" | "codes">("overview");

  // Redirect if not admin (using useEffect to avoid render-phase side effect)
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Show loading while checking auth
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStatistics.useQuery();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery();
  const { data: resellers, isLoading: resellersLoading, refetch: refetchResellers } = trpc.admin.getAllResellers.useQuery();
  const { data: plans, isLoading: plansLoading } = trpc.admin.getAllPlans.useQuery();
  
  // Form states
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState<"reseller_credit" | "reseller_monthly" | "customer">("reseller_credit");
  const [planPrice, setPlanPrice] = useState("");
  const [planMaxApps, setPlanMaxApps] = useState("999");
  const [planMaxDns, setPlanMaxDns] = useState("3");
  const [planMaxUsers, setPlanMaxUsers] = useState("");
  const [planCredits, setPlanCredits] = useState("");
  const [planContractDuration, setPlanContractDuration] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  // Reseller form states
  const [resellerCompanyName, setResellerCompanyName] = useState("");
  const [resellerType, setResellerType] = useState<"credit" | "monthly">("credit");
  const [resellerInitialCredits, setResellerInitialCredits] = useState("1000");
  const [resellerPlanId, setResellerPlanId] = useState<number | null>(null);

  // Edit reseller modal states
  const [editingResellerId, setEditingResellerId] = useState<number | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "suspended" | "inactive">("active");
  const [editPixKey, setEditPixKey] = useState("");

  // Edit customer modal states
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [editCustomerAppId, setEditCustomerAppId] = useState<number | null>(null);
  const [editCustomerListUrl, setEditCustomerListUrl] = useState("");
  const [editCustomerUsername, setEditCustomerUsername] = useState("");
  const [editCustomerPassword, setEditCustomerPassword] = useState("");
  const [editCustomerActivationDate, setEditCustomerActivationDate] = useState("");
  const [editCustomerStatus, setEditCustomerStatus] = useState<"active" | "inactive" | "blocked">("active");

  // App form states
  const [appName, setAppName] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [appCode, setAppCode] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appApiUrl, setAppApiUrl] = useState("");
  const [appLogoUrl, setAppLogoUrl] = useState("");

  // Mutations
  const addCreditsMutation = trpc.admin.addCreditsToReseller.useMutation({
    onSuccess: () => {
      toast.success("Créditos adicionados com sucesso!");
      setCreditAmount("");
      setSelectedResellerId(null);
      refetchResellers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar créditos");
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário deletado com sucesso!");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar usuário");
    },
  });

  const deleteResellerMutation = trpc.admin.deleteReseller.useMutation({
    onSuccess: () => {
      toast.success("Revendedor deletado com sucesso!");
      refetchResellers();
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar revendedor");
    },
  });

  const blockUserMutation = trpc.admin.blockUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário bloqueado com sucesso!");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao bloquear usuário");
    },
  });

  const unblockUserMutation = trpc.admin.unblockUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário desbloqueado com sucesso!");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao desbloquear usuário");
    },
  });

  const updateResellerMutation = trpc.admin.updateReseller.useMutation({
    onSuccess: () => {
      toast.success("Revendedor atualizado com sucesso!");
      setEditingResellerId(null);
      setEditCompanyName("");
      refetchResellers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar revendedor");
    },
  });

  const createPlanMutation = trpc.admin.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      setPlanName("");
      setPlanPrice("");
      setPlanDescription("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar plano");
    },
  });

  const deletePlanMutation = trpc.admin.deletePlan.useMutation({
    onSuccess: () => {
      toast.success("Plano deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar plano");
    },
  });

  const createAppMutation = trpc.admin.createApp.useMutation({
    onSuccess: () => {
      toast.success("Aplicativo criado com sucesso!");
      setAppName("");
      setAppVersion("");
      setAppCode("");
      setAppDescription("");
      setAppApiUrl("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao criar aplicativo");
    },
  });

  const deleteAppMutation = trpc.admin.deleteApp.useMutation({
    onSuccess: () => {
      toast.success("Aplicativo deletado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao deletar aplicativo");
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

  const handleDeleteUser = (userId: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      deleteUserMutation.mutate({ userId });
    }
  };

  const handleDeleteReseller = (resellerId: number) => {
    console.log("[DEBUG] handleDeleteReseller called with:", resellerId);
    if (confirm("Tem certeza que deseja deletar este revendedor?")) {
      console.log("[DEBUG] Calling deleteResellerMutation.mutate");
      deleteResellerMutation.mutate({ resellerId });
      console.log("[DEBUG] deleteResellerMutation.mutate called");
    }
  };

  const handleBlockUser = (userId: number, currentStatus: string) => {
    if (currentStatus === "active") {
      blockUserMutation.mutate({ userId });
    } else {
      unblockUserMutation.mutate({ userId });
    }
  };

  const updateCustomerMutation = trpc.admin.updateCustomer.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      setEditingCustomerId(null);
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar cliente");
    },
  });

  const handleEditCustomer = (customerId: number) => {
    const customer = users?.find(u => u.id === customerId);
    if (customer) {
      setEditingCustomerId(customerId);
      setEditCustomerStatus(customer.status as "active" | "inactive" | "blocked");
    }
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomerId) return;

    const updates: any = {};
    if (editCustomerAppId !== null) updates.applicationId = editCustomerAppId;
    if (editCustomerListUrl) updates.iptvListUrl = editCustomerListUrl;
    if (editCustomerUsername) updates.customerUsername = editCustomerUsername;
    if (editCustomerPassword) updates.customerPassword = editCustomerPassword;
    if (editCustomerActivationDate) updates.activationDate = new Date(editCustomerActivationDate);
    if (editCustomerStatus) updates.status = editCustomerStatus;

    updateCustomerMutation.mutate({
      customerId: editingCustomerId,
      ...updates,
    });
  };

  const handleCreatePlan = () => {
    console.log("[DEBUG] handleCreatePlan called");
    if (!planName || !planPrice) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    console.log("[DEBUG] Calling createPlanMutation.mutate");
    createPlanMutation.mutate({
      name: planName,
      type: planType,
      price: parseFloat(planPrice),
      maxApplications: parseInt(planMaxApps),
      maxDns: parseInt(planMaxDns),
      maxUsers: planMaxUsers ? parseInt(planMaxUsers) : undefined,
      credits: planCredits ? parseInt(planCredits) : undefined,
      contractDuration: planContractDuration ? parseInt(planContractDuration) : undefined,
      description: planDescription,
    });
    console.log("[DEBUG] createPlanMutation.mutate called");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">Gerencie usuários, revendedores, aplicativos e planos</p>
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

        {/* Tabs Navigation */}
        <div className="flex gap-2 border-b border-border/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("resellers")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "resellers"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Revendedores
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "customers"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "apps"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Aplicativos
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Plans Management Section */}
            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-bold mb-6">Gerenciar Planos</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Nome do Plano</Label>
                  <Input
                    placeholder="Ex: Plano Premium"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo</Label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as "reseller_credit" | "reseller_monthly" | "customer")}
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:outline-none focus:border-accent/50"
                  >
                    <option value="reseller_credit">Revendedor Crédito</option>
                    <option value="reseller_monthly">Revendedor Mensalista</option>
                    <option value="customer">Usuário Final</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Preço</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Máx de Apps</Label>
                  <Input
                    type="number"
                    value={planMaxApps}
                    onChange={(e) => setPlanMaxApps(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                    min="1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Máx de DNS</Label>
                  <Input
                    type="number"
                    value={planMaxDns}
                    onChange={(e) => setPlanMaxDns(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Descrição</Label>
                  <Input
                    placeholder="Descrição do plano"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Máx de Usuários (Plano Mensalista)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    value={planMaxUsers}
                    onChange={(e) => setPlanMaxUsers(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                    min="1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Créditos (Plano Crédito)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 1000"
                    value={planCredits}
                    onChange={(e) => setPlanCredits(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                    min="1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Duração do Contrato (dias)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 30, 90, 180, 365"
                    value={planContractDuration}
                    onChange={(e) => setPlanContractDuration(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                    min="1"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreatePlan}
                disabled={createPlanMutation.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {createPlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Plano
                  </>
                )}
              </Button>

              {/* Plans List */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Planos Existentes</h3>
                {plansLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 font-semibold">Nome</th>
                          <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                          <th className="text-left py-3 px-4 font-semibold">Preço</th>
                          <th className="text-left py-3 px-4 font-semibold">Apps</th>
                          <th className="text-left py-3 px-4 font-semibold">DNS</th>
                          <th className="text-left py-3 px-4 font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans?.map((plan) => (
                          <tr key={plan.id} className="border-b border-border/50 hover:bg-accent/5">
                            <td className="py-3 px-4">{plan.name}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                                {plan.type === "reseller_credit" ? "Crédito" : plan.type === "reseller_monthly" ? "Mensalista" : "Cliente"}
                              </span>
                            </td>
                            <td className="py-3 px-4">R$ {parseFloat(plan.price.toString()).toFixed(2)}</td>
                            <td className="py-3 px-4">{plan.maxApplications === 999 ? "Ilimitado" : plan.maxApplications}</td>
                            <td className="py-3 px-4">{plan.maxDns}</td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deletePlanMutation.mutate({ planId: plan.id });
                                }}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

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
                  <Label className="text-sm font-medium mb-2 block">Quantidade de Créditos</Label>
                  <Input
                    type="number"
                    placeholder="Digite a quantidade"
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
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Créditos
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Resellers Tab */}
        {activeTab === "resellers" && (
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
                      <th className="text-left py-3 px-4 font-semibold">Quantidade de Créditos</th>
                      <th className="text-left py-3 px-4 font-semibold">Créditos Usados</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Ações</th>
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
                        <td className="py-3 px-4 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingResellerId(reseller.id);
                              setEditCompanyName(reseller.companyName);
                              setEditStatus(reseller.status as "active" | "suspended" | "inactive");
                            }}
                            className="text-accent hover:text-accent/80 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteReseller(reseller.id);
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Deletar"
                            disabled={deleteResellerMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Edit Reseller Modal */}
        {editingResellerId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md border-border/50">
              <h2 className="text-xl font-bold mb-6">Editar Revendedor</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Nome da Empresa</Label>
                  <Input
                    placeholder="Nome da empresa"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "active" | "suspended" | "inactive")}
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-input focus:outline-none focus:border-accent/50"
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Chave PIX</Label>
                  <Input
                    placeholder="Ex: chave@pix.com ou CPF"
                    value={editPixKey}
                    onChange={(e) => setEditPixKey(e.target.value)}
                    className="bg-input border-border/50 focus:border-accent/50"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      updateResellerMutation.mutate({
                        resellerId: editingResellerId,
                        companyName: editCompanyName,
                        status: editStatus,
                        pixKey: editPixKey || undefined,
                      });
                    }}
                    disabled={updateResellerMutation.isPending}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {updateResellerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditingResellerId(null)}
                    className="flex-1 bg-muted hover:bg-muted/80"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-bold mb-6">Gestão de Clientes</h2>
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
                      <th className="text-left py-3 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.filter((u) => u.role === "customer").map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-accent/5">
                        <td className="py-3 px-4">{u.username}</td>
                        <td className="py-3 px-4">{u.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                            Cliente
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
                        <td className="py-3 px-4 flex gap-2">
                          <button
                            onClick={() => handleEditCustomer(u.id)}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleBlockUser(u.id, u.status)}
                            className="text-yellow-500 hover:text-yellow-600 transition-colors"
                            title="Bloquear/Desbloquear"
                            disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
                          >
                            🔒
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteUser(u.id);
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Deletar"
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Edit Customer Modal */}
        {editingCustomerId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-2xl p-6 border-border/50 rounded-lg">
                <h3 className="text-xl font-bold mb-6">Editar Cliente</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Aplicativo</Label>
                    <select
                      value={editCustomerAppId || ""}
                      onChange={(e) => setEditCustomerAppId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 bg-input border border-border/50 rounded-md"
                    >
                      <option value="">Selecione um aplicativo</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Lista IPTV</Label>
                    <Input
                      placeholder="https://example.com/lista.m3u"
                      value={editCustomerListUrl}
                      onChange={(e) => setEditCustomerListUrl(e.target.value)}
                      className="bg-input border-border/50 focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Usuário</Label>
                    <Input
                      placeholder="Ex: usuario123"
                      value={editCustomerUsername}
                      onChange={(e) => setEditCustomerUsername(e.target.value)}
                      className="bg-input border-border/50 focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Senha</Label>
                    <Input
                      type="password"
                      placeholder="Ex: senha123"
                      value={editCustomerPassword}
                      onChange={(e) => setEditCustomerPassword(e.target.value)}
                      className="bg-input border-border/50 focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Data de Ativação</Label>
                    <Input
                      type="datetime-local"
                      value={editCustomerActivationDate}
                      onChange={(e) => setEditCustomerActivationDate(e.target.value)}
                      className="bg-input border-border/50 focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <select
                      value={editCustomerStatus}
                      onChange={(e) => setEditCustomerStatus(e.target.value as "active" | "inactive" | "blocked")}
                      className="w-full px-3 py-2 bg-input border border-border/50 rounded-md"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateCustomer}
                    disabled={updateCustomerMutation.isPending}
                    className="bg-accent hover:bg-accent/90"
                  >
                    {updateCustomerMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    onClick={() => setEditingCustomerId(null)}
                    variant="outline"
                    className="border-border/50"
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            </div>
          )}

        {/* Apps Tab */}
        {activeTab === "apps" && (
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-bold mb-6">Aplicativos</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nome do App</Label>
                <Input
                  placeholder="Ex: Netflix"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="bg-input border-border/50 focus:border-accent/50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Versão</Label>
                <Input
                  placeholder="1.0.0"
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  className="bg-input border-border/50 focus:border-accent/50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Código</Label>
                <Input
                  placeholder="APP001"
                  value={appCode}
                  onChange={(e) => setAppCode(e.target.value)}
                  className="bg-input border-border/50 focus:border-accent/50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">URL da API</Label>
                <Input
                  placeholder="https://api.example.com"
                  value={appApiUrl}
                  onChange={(e) => setAppApiUrl(e.target.value)}
                  className="bg-input border-border/50 focus:border-accent/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium mb-2 block">Descrição</Label>
                <Input
                  placeholder="Descrição do aplicativo"
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  className="bg-input border-border/50 focus:border-accent/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium mb-2 block">URL da Logo</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={appLogoUrl}
                  onChange={(e) => setAppLogoUrl(e.target.value)}
                  className="bg-input border-border/50 focus:border-accent/50"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                if (!appName || !appCode || !appVersion) {
                  toast.error("Preencha todos os campos obrigatórios");
                  return;
                }
                createAppMutation.mutate({
                  name: appName,
                  code: appCode,
                  version: appVersion,
                  description: appDescription,
                  logoUrl: appLogoUrl || undefined,
                });
              }}
              disabled={createAppMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {createAppMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Aplicativo
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
