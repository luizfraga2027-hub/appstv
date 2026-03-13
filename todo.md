# AppsTV — Cronograma Completo (12 Fases)

## ⚠️ REGRAS PRINCIPAIS - OBRIGATÓRIO SEGUIR
- ❌ **PROIBIDO ABSOLUTO**: E-mail em qualquer lugar (cadastro, login, notificações, etc)
- ❌ **PROIBIDO ABSOLUTO**: OAuth, Google Login, GitHub Login, Stripe, Manus OAuth
- ❌ **PROIBIDO ABSOLUTO**: Qualquer serviço externo de autenticação ou pagamento
- ✅ **OBRIGATÓRIO**: Autenticação JWT local com username + password APENAS
- ✅ **OBRIGATÓRIO**: Sistema 100% independente, sem dependências externas

---

## FASE 1: Autenticação ✅
- [x] Tabela users: id, username, password_hash, name, role, status (SEM EMAIL)
- [x] Login/Registro LOCAL (username + password, SEM e-mail)
- [x] JWT + cookie seguro
- [x] URLs exclusivas: Landing Page (usuário final), /admin/login (admin), /reseller/login (revendedor)
- [x] Validação de entradas
- [ ] Testes vitest: login, logout, acesso protegido

---

## FASE 2: Dashboard Básico
- [ ] **Usuário Final**: Visualizar assinatura, status, data expiração, adicionar lista IPTV (URL M3U)
- [ ] **Revendedor**: Dashboard com estatísticas (clientes ativos/expirados, ativações, créditos)
- [ ] **Admin**: Dashboard geral (total usuários, revendedores, ativações, créditos vendidos)

---

## FASE 3: Planos Exclusivos ✅ COMPLETO
- [x] Criar schema de planos (plans, planFeatures, userSubscriptions)
- [x] Implementar helpers de banco de dados para planos
- [x] Criar rotas tRPC para gerenciamento de planos
- [x] Implementar painel administrativo para CRUD de planos
- [x] Tabela de planos: id, name, type (CREDIT ou MONTHLY), maxApps, maxDns, price
- [ ] Usuário final → plano individual / assinatura anual
- [ ] Revendedor mensalista → limite de aplicativos e DNS por plano
- [ ] Revendedor crédito → acesso a todos aplicativos, cada ativação = 1 crédito
- [ ] Diferenciar mensalista x crédito no fluxo de criação

---

## FASE 4: Gestão de Aplicativos (Admin)
- [ ] Tabela applications: id, name, version, code, description, apiUrl, status, createdAt
- [ ] Cadastrar aplicativo: nome, versão, código, descrição, API, status
- [ ] Ativar / desativar aplicativos
- [ ] Liberar aplicativos para revendedores mensalistas
- [ ] Apps por crédito → liberados automaticamente
- [ ] Apps por mensalista → restrição configurável
- [ ] Logs de API e validação de acesso

---

## FASE 5: Gestão de Códigos de Aplicativos
- [ ] Tabela appCodes: id, code, resellerId, appId, dnsCount, status, createdAt
- [ ] **Revendedor Mensalista**:
  - [ ] Criar código de ativação por aplicativo permitido
  - [ ] Definir quantidade de DNS (limitada pelo plano)
  - [ ] Associar DNS ao código
- [ ] **Usuário Final**:
  - [ ] Inserir código + usuário + senha no aplicativo
  - [ ] Sistema valida código + DNS + MAC ID

---

## FASE 6: Ativação de Clientes (MAC ID)
- [ ] Tabela macActivations: id, macId, resellerId, appId, iptvListUrl, dns1, dns2, dns3, clientName, expirationDate, status
- [ ] **Revendedor Crédito**:
  - [ ] Cada MAC ID ativado = 1 crédito descontado
  - [ ] Inserir: MAC ID + lista IPTV + aplicativo
  - [ ] Registrar: revendedor, aplicativo, MAC ID, lista, DNS, data ativação/expiração (12 meses)
- [ ] **Revendedor Mensalista**:
  - [ ] Cada MAC ID ativado não consome crédito
  - [ ] Inserir: MAC ID + lista IPTV + código do aplicativo + DNS associada
- [ ] Limite: 1 MAC ID = 1 dispositivo
- [ ] Bloqueio de MAC duplicado
- [ ] Anti-compartilhamento de lista IPTV
- [ ] Logs de acesso (MAC, IP, data/hora, aplicativo, status)

---

## FASE 7: Painel do Revendedor
- [ ] **Comum a ambos os tipos**:
  - [ ] Clientes ativados: tabela com MAC ID, aplicativo, lista IPTV, DNS, data ativação/expiração, status
  - [ ] Editar lista IPTV individual por MAC ID
  - [ ] Deletar MAC ID
- [ ] **Mensalista**:
  - [ ] Criar código de ativação para cada aplicativo liberado
  - [ ] Definir quantidade de DNS por código
  - [ ] Visualizar conexões disponíveis x usadas
  - [ ] Visualizar aplicativos autorizados
  - [ ] Visualizar código de ativação único
- [ ] **Crédito**:
  - [ ] Ativar clientes usando créditos
  - [ ] Visualizar saldo de créditos e histórico de transações

---

## FASE 8: Painel do Usuário Final
- [ ] Adicionar lista IPTV
- [ ] Visualizar status da assinatura
- [ ] Visualizar dispositivos ativados (MAC IDs)
- [ ] Comprar créditos (opcional)
- [ ] Ativar aplicativo usando código + usuário + senha
- [ ] Sistema valida automaticamente e registra MAC ID, lista, DNS

---

## FASE 9: Painel Administrativo Avançado ✅ PARCIAL
- [x] **Gestão de Revendedores**: CRUD básico (criar, editar, deletar) ✅
  - [x] Editar status (ativo/suspenso/inativo)
  - [x] Deletar revendedor
  - [x] Adicionar/remover créditos
  - [ ] Criar revendedor: definir tipo (CREDIT ou MONTHLY), plano, DNS (se monthly), aplicativos permitidos
  - [ ] Bloquear/desbloquear revendedor
  - [ ] Visualizar código de ativação (mensalista)
- [ ] **Gestão de Clientes**:
  - [ ] Visualizar todos clientes
  - [ ] Transferir clientes entre revendedores
  - [ ] Bloquear/excluir MAC
- [ ] **Gestão de Aplicativos**:
  - [ ] Cadastrar, ativar, desativar, editar, excluir
  - [ ] Associar API de cada app
- [ ] **Gestão de Códigos**:
  - [ ] Definir apps liberados para revendedores mensalistas
  - [ ] Limitar quantidade de DNS por código
- [ ] **Logs**:
  - [ ] Acessos, falhas, tentativas de login, MAC inválidos

---

## FASE 10: API para Aplicativos Smart TV
- [ ] POST /api/app/activate → ativação por MAC + código + DNS
- [ ] POST /api/app/validate → valida usuário, código, MAC, DNS
- [ ] POST /api/app/check → retorna lista IPTV, status, expiração
- [ ] Validação de MAC ID
- [ ] Validação de assinatura ativa
- [ ] Controle de DNS
- [ ] Anti-compartilhamento de lista IPTV
- [ ] Logs de acesso

---

## FASE 11: Segurança e Validações
- [ ] Limite de dispositivos: 1 MAC ID = 1 ativação
- [ ] Bloqueio de MAC duplicado
- [ ] Verificação de DNS correta para revenda mensalista
- [ ] Anti-compartilhamento de lista IPTV
- [ ] Logs de auditoria completos
- [ ] Validação de entradas em todos os endpoints
- [ ] Rate limiting em APIs
- [ ] Proteção contra SQL injection, XSS, CSRF

---

## FASE 12: Testes Completos (Vitest) ✅ PARCIAL
- [x] Testar CRUD de revendedores (criar, editar, deletar) ✅
- [x] Testar cache invalidation ao deletar revendedor ✅
- [ ] Testar autenticação (todos os tipos de usuário)
- [ ] Testar ativação por MAC ID (mensalista e crédito)
- [ ] Testar uso de DNS e anti-compartilhamento
- [ ] Testar dashboard de revendedor (histórico, ativações, saldo de créditos)
- [ ] Testar painel do usuário final (lista IPTV, status, dispositivos)
- [ ] Testar API para apps
- [ ] Testar restrição de acesso (landing page, revendedor, admin)
- [ ] Testes de segurança (validações, rate limiting)

---

## 📋 Resumo Final
✅ Sistema multiaplicativo
✅ Diferenciação completa entre revendedor mensalista e crédito
✅ Painéis separados, URLs protegidas
✅ Usuário final só vê: código, usuário, senha e lista IPTV (SEM DNS, SEM e-mail)
✅ DNS controlada pelo revendedor mensalista, limitada pelo plano
✅ Anti-compartilhamento de lista IPTV, cada MAC ID = 1 ativação
✅ Admin controla aplicativos, revendedores e planos
✅ **ZERO E-MAIL, ZERO OAUTH, ZERO SERVIÇOS EXTERNOS**
✅ Autenticação 100% local com JWT + username + password

---

## 🔧 BUGS A CORRIGIR - PRIORIDADE ALTA

- [ ] Créditos de revendedor demorando para atualizar em tempo real
- [ ] Status (ativo/suspenso/inativo) demorando para atualizar
- [ ] Planos criados não estão sendo salvos
- [ ] Aplicativos criados não estão sendo salvos
- [ ] Falta campo para remover créditos de revendedor crédito

---

## 📋 NOVAS FUNCIONALIDADES - ADMIN DASHBOARD

### Revendedores
- [ ] Campo: Tipo de Revendedor (Mensalista / Crédito)
- [ ] Campo: Data de Ativação (apenas para Mensalista)
- [ ] Campo: Prazo (1 mês, 2 meses, 3 meses, 1 ano)
- [ ] Campo: Usuário e Senha (com opção de alterar)
- [ ] Campo: Alterar Plano (Mensalista ↔ Crédito)
- [ ] Campo: Aplicativos Permitidos
- [ ] Campo: Quantidade de DNS (decidido pelo admin, máx 10)
- [ ] Campo: Chave PIX

### Planos (3 tipos)
- [ ] **Plano Revendedor Mensalista**: usuários ativos, aplicativos, DNS, tempo contratação, valores, obs
- [ ] **Plano Revendedor Crédito**: quantidade créditos, aplicativos, DNS ilimitado, valores, obs
- [ ] **Plano Usuário Final**: aplicativos, valores, tempo contratação, obs

### Gestão de Clientes
- [ ] Campo: Qual aplicativo está usando
- [ ] Campo: Qual lista IPTV adicionou
- [ ] Campo: Usuário e Senha (com opção de alterar)
- [ ] Campo: Data de Ativação (via MAC)
- [ ] Campo: Status (Ativo / Suspenso / Inativo)

### Aplicativos
- [ ] Campo: Logo do Aplicativo (com tamanho adequado)
- [ ] Exibir logo nos painéis de revendedor e usuário final

---

## 🧪 TESTES VITEST NECESSÁRIOS

- [ ] Testar criação de revendedor com tipo (mensalista/crédito)
- [ ] Testar atualização de créditos em tempo real
- [ ] Testar atualização de status em tempo real
- [ ] Testar criação de planos específicos
- [ ] Testar criação de aplicativos com logo
- [ ] Testar gestão de clientes com novos campos
