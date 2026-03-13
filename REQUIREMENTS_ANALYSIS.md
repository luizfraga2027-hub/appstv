# Análise de Requisitos - AppsTV Melhorias

## Bugs Críticos a Corrigir

1. **Atualização Lenta de Créditos** - Campo de crédito do revendedor está demorando para atualizar
2. **Atualização Lenta de Status** - Status (ativo/suspenso/inativo) do revendedor está demorando para atualizar
3. **Atualização Lenta de Planos** - Planos criados estão demorando para atualizar
4. **Aplicativos Não Salvam** - Aplicativos criados não estão sendo salvos

## Campos Faltantes

### Painel Admin - Revendedores
- [ ] Campo para remover crédito de revendedor crédito
- [ ] Campo para definir tipo de revendedor (mensalista/crédito)
- [ ] Campo para definir data de ativação (revendedor mensalista)
- [ ] Campo para definir quantidade de crédito (revendedor crédito)
- [ ] Campo para alterar plano (mensalista ↔ crédito)
- [ ] Campo para definir qual aplicativo o revendedor pode usar
- [ ] Campo de usuário e senha (com opção de alterar senha)
- [ ] Campo de chave PIX

### Painel Admin - Aplicativos
- [ ] Campo para logo do aplicativo (com tamanho adequado)

### Painel Admin - Clientes
- [ ] Campo de qual aplicativo está usando
- [ ] Campo de qual lista IPTV adicionou
- [ ] Campo de usuário e senha
- [ ] Campo de data de ativação do aplicativo (via MAC)
- [ ] Campo de status (ativo/suspenso/inativo)

### Painel Admin - Planos
- [ ] Max de DNS agora é configurável pelo admin (não fixo em 10)

## Tipos de Planos (3 tipos)

### 1. Plano Revendedor Mensalista
- Quantidade de usuários ativos
- Quantidade de aplicativos
- Quantidade de DNS
- Tempo de contração
- Valor
- Observação

### 2. Plano Revendedor Crédito
- Quantidade de créditos
- Quantidade de aplicativos
- Quantidade de DNS (ilimitado)
- Valor
- Observação

### 3. Plano Usuário Final
- Quantidade de aplicativos
- Valor
- Tempo de contração
- Observação

## Fluxo de Revendedor

1. Revendedor cria conta
2. Escolhe plano (mensalista/crédito)
3. Gera chave PIX para pagamento
4. Faz o pagamento
5. Admin ativa o revendedor

## Prioridades

1. **URGENTE**: Corrigir bugs de atualização em tempo real (cache/invalidação)
2. **ALTA**: Adicionar campos faltantes ao schema
3. **ALTA**: Implementar tipos de revendedor e planos
4. **MÉDIA**: Adicionar chave PIX
5. **MÉDIA**: Adicionar logo de aplicativo
6. **BAIXA**: Melhorar validações e UX

## Impacto no Schema

### Tabela `resellers`
- Adicionar: `type` (enum: 'monthly', 'credit')
- Adicionar: `activationDate` (para mensalista)
- Adicionar: `pixKey` (string)
- Adicionar: `allowedApps` (JSON array de IDs)
- Adicionar: `username` (string)
- Adicionar: `password` (string hash)

### Tabela `plans`
- Adicionar: `type` (enum: 'reseller_monthly', 'reseller_credit', 'end_user')
- Adicionar: `maxDns` (number, configurável)
- Adicionar: `maxUsers` (para monthly)
- Adicionar: `credits` (para credit)

### Tabela `applications`
- Adicionar: `logo` (string URL)

### Tabela `customers`
- Adicionar: `applicationId` (FK)
- Adicionar: `iptv_list` (string)
- Adicionar: `username` (string)
- Adicionar: `password` (string hash)
- Adicionar: `activationDate` (date)
- Adicionar: `status` (enum: 'active', 'suspended', 'inactive')
