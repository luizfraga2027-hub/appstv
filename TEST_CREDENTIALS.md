# AppsTV - Credenciais de Teste

## 🔐 Usuários de Teste

### 1. **Admin** - Painel Administrativo
- **URL**: `/dashboard/admin`
- **Username**: `admin`
- **Password**: `admin123`
- **Acesso**: 
  - Visualizar estatísticas gerais
  - Gerenciar todos os usuários
  - Gerenciar revendedores
  - Adicionar créditos a revendedores
  - Visualizar logs de acesso
  - Ver analytics da plataforma

### 2. **Reseller** - Painel do Revendedor
- **URL**: `/dashboard/reseller`
- **Username**: `reseller`
- **Password**: `reseller123`
- **Acesso**:
  - Gerar códigos de ativação
  - Visualizar clientes ativados
  - Gerenciar MAC IDs
  - Ver histórico de transações
  - Bulk generate de códigos
  - Export de dados em CSV
  - Analytics de revendedor
  - **Créditos Iniciais**: 1000

### 3. **Customer** - Painel do Cliente
- **URL**: `/dashboard/customer`
- **Username**: `customer`
- **Password**: `customer123`
- **Acesso**:
  - Ativar códigos de ativação
  - Registrar dispositivos
  - Visualizar assinatura ativa
  - Ver histórico de assinaturas
  - Gerenciar lista IPTV

---

## 🚀 Como Criar os Usuários de Teste

### Opção 1: Via Interface (Recomendado)
1. Acesse a página de login
2. Clique em "Criar Conta"
3. Crie 3 contas com as credenciais acima
4. Após criar a conta de revendedor, o admin pode adicionar créditos

### Opção 2: Via Script de Seed
```bash
cd /home/ubuntu/appstv
node seed-users.mjs
```

---

## 📍 Fluxo de Teste Recomendado

### 1. **Teste Admin**
```
1. Login com admin/admin123
2. Acesse /dashboard/admin
3. Visualize estatísticas
4. Veja a lista de usuários e revendedores
5. Adicione créditos ao revendedor
```

### 2. **Teste Reseller**
```
1. Login com reseller/reseller123
2. Acesse /dashboard/reseller
3. Gere códigos de ativação
4. Visualize clientes ativados
5. Veja analytics
6. Exporte dados em CSV
```

### 3. **Teste Customer**
```
1. Login com customer/customer123
2. Acesse /dashboard/customer
3. Ative um código (use um gerado pelo revendedor)
4. Registre um dispositivo
5. Visualize assinatura ativa
```

---

## 🔄 Fluxo Completo de Ativação

### Passo 1: Admin adiciona créditos ao revendedor
- Admin → Dashboard Admin → Adicionar Créditos
- Seleciona revendedor e adiciona créditos

### Passo 2: Revendedor gera códigos de ativação
- Reseller → Dashboard Reseller → Gerar Códigos
- Define quantidade e duração
- Copia os códigos gerados

### Passo 3: Customer ativa o código
- Customer → Dashboard Customer → Ativar Código
- Cola o código recebido
- Assinatura é ativada automaticamente

### Passo 4: Customer registra dispositivo
- Customer → Dashboard Customer → Aba Dispositivos
- Registra um novo dispositivo
- Agora pode usar o IPTV

---

## 📊 Estrutura de Dados

### Usuários
- **Admin**: Gerencia a plataforma
- **Reseller**: Distribui códigos e gerencia clientes
- **Customer**: Usa os serviços IPTV

### Créditos
- Revendedor começa com 1000 créditos
- Cada ativação de MAC ID custa 1 crédito
- Admin pode adicionar/remover créditos

### Códigos de Ativação
- Válidos por 1 ano
- Podem ser para 30, 90, 180 ou 365 dias
- Uma vez ativado, não pode ser reutilizado

### MAC IDs
- Identificam dispositivos IPTV
- Têm data de expiração
- Podem ter lista IPTV customizada

---

## 🐛 Troubleshooting

### "Código não encontrado"
- Certifique-se que o código foi gerado pelo revendedor
- Verifique se o código não expirou
- Verifique se o código não foi já ativado

### "Sem créditos suficientes"
- Admin precisa adicionar créditos ao revendedor
- Cada ativação custa 1 crédito

### "Sem assinatura ativa"
- Customer precisa ativar um código primeiro
- Acesse Dashboard Customer → Ativar Código

---

## 📱 URLs Principais

| Página | URL |
|--------|-----|
| Home | `/` |
| Login | `/login` |
| Admin Dashboard | `/dashboard/admin` |
| Reseller Dashboard | `/dashboard/reseller` |
| Customer Dashboard | `/dashboard/customer` |
| Customer IPTV | `/dashboard/customer/iptv` |

---

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT local
- Sem dependências externas (OAuth, email, etc)
- Isolamento de dados por role
- Validação de créditos antes de ativação

---

## 📝 Notas

- Todos os dados são armazenados localmente no banco TiDB
- Não há integração com serviços externos
- O sistema é 100% independente
- Pode ser facilmente customizado para produção
