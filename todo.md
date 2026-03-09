# AppsTV — TODO List

## FASE 1: Autenticação JWT Local
- [x] Remover OAuth Manus do schema e contexto
- [x] Criar tabela users com campos: id, username, password_hash, name, role, status
- [x] Implementar bcryptjs para hash de senhas
- [x] Criar procedimento de registro (POST /api/auth/register)
- [x] Criar procedimento de login com JWT (POST /api/auth/login)
- [x] Criar procedimento de logout (POST /api/auth/logout)
- [x] Criar middleware de proteção de rotas com JWT
- [ ] Implementar testes de autenticação

## FASE 2: Sistema de Créditos e Revendedores
- [x] Criar tabela resellers com campos: id, userId, companyName, creditBalance, status
- [x] Criar tabela credit_transactions com campos: id, resellerId, amount, type, description
- [x] Implementar procedimento: admin adiciona créditos para revendedor
- [x] Implementar procedimento: revendedor visualiza saldo de créditos
- [x] Implementar procedimento: histórico de transações de créditos
- [ ] Implementar testes de sistema de créditos

## FASE 3: Códigos de Ativação
- [x] Criar tabela activation_codes com campos: id, code, resellerId, customerId, status, expirationDate
- [x] Implementar geração de códigos únicos (30, 90, 180, 365 dias)
- [x] Implementar procedimento: revendedor gera códigos de ativação
- [x] Implementar procedimento: listar códigos gerados por revendedor
- [x] Implementar procedimento: validar código de ativação
- [ ] Implementar testes de códigos de ativação

## FASE 4: Sistema de Assinaturas
- [x] Criar tabela subscriptions com campos: id, customerId, activationCodeId, status, startDate, expirationDate
- [x] Criar tabela devices com campos: id, subscriptionId, deviceId, deviceName, lastAccessAt
- [x] Implementar procedimento: cliente ativa código de ativação
- [x] Implementar procedimento: verificar status de assinatura
- [x] Implementar procedimento: registrar dispositivo
- [ ] Implementar procedimento: renovar assinatura
- [x] Implementar API para Smart TV validar código e verificar status

## FASE 5: Landing Page
- [x] Criar layout da landing page com visual elegante
- [x] Adicionar seção de explicação do serviço
- [x] Adicionar aviso: "NÃO vendemos listas IPTV ou conteúdo"
- [x] Adicionar botões de login e cadastro
- [x] Adicionar seção FAQ
- [x] Implementar responsividade

## FASE 6: Dashboard Administrativo
- [x] Criar layout do dashboard admin com sidebar
- [x] Implementar página de visão geral (overview)
- [x] Implementar gerenciamento de usuários
- [x] Implementar gerenciamento de revendedores
- [x] Implementar visualização de estatísticas globais
- [ ] Implementar histórico de transações
- [ ] Implementar geração de relatórios

## FASE 7: Dashboard de Revendedor
- [x] Criar layout do dashboard revendedor
- [x] Implementar visualização de saldo de créditos
- [x] Implementar geração de códigos de ativação
- [x] Implementar listagem de códigos gerados
- [ ] Implementar visualização de clientes vinculados
- [x] Implementar histórico de ativações
- [ ] Implementar estatísticas de vendas

## FASE 8: Dashboard de Cliente
- [x] Criar layout do dashboard cliente
- [x] Implementar visualização de assinaturas ativas
- [x] Implementar visualização de data de expiração
- [x] Implementar listagem de dispositivos ativados
- [x] Implementar histórico de ativações
- [x] Implementar funcionalidade de ativar novo código
- [ ] Implementar renovação de assinatura

## FASE 9: Testes e Integração
- [ ] Escrever testes unitários para autenticação
- [ ] Escrever testes para sistema de créditos
- [ ] Escrever testes para códigos de ativação
- [ ] Escrever testes para assinaturas
- [ ] Testar fluxos completos (revendedor → cliente)
- [ ] Testar API Smart TV
- [ ] Testar hierarquia de permissões

## FASE 10: Deploy e Documentação
- [ ] Criar documentação de instalação
- [ ] Criar documentação de configuração
- [ ] Criar guia de uso para admin
- [ ] Criar guia de uso para revendedor
- [ ] Criar guia de uso para cliente
- [ ] Preparar para deploy em VPS Linux com PM2 e Nginx
- [ ] Criar checkpoint final


## FASE 10: Melhoria Visual da Landing Page
- [x] Redesenhar landing page com fundo escuro elegante
- [x] Implementar paleta de cores vibrantes (verde neon, laranja, azul ciano)
- [x] Adicionar aviso legal proeminente (banner ou modal)
- [x] Criar grid de features bem organizado
- [x] Melhorar tipografia e hierarquia visual
- [x] Implementar animações sutis e transições
- [x] Testar responsividade mobile/tablet/desktop
- [x] Adicionar seção de compatibilidade com dispositivos


## FASE 11: Página Administrativa Exclusiva
- [x] Remover links de admin da landing page e navegação pública
- [x] Criar página de login admin com URL secreta
- [x] Implementar proteção de rota para admin (verificação de role)
- [x] Testar acesso e segurança


## FASE 12: Limpeza Completa - Remover E-mail e Serviços Externos
- [x] Remover campo email da tabela users no schema
- [x] Remover campo loginMethod da tabela users
- [x] Atualizar migrations do banco de dados
- [x] Remover validação de e-mail do registro
- [x] Remover validação de e-mail do login
- [x] Remover todas as referências a OAuth no código
- [x] Remover integração com Manus OAuth
- [x] Remover integração com Google/GitHub
- [x] Remover integração com Stripe
- [x] Auditar e remover qualquer serviço externo
- [x] Testar login/registro com apenas username + password
- [x] Verificar que nenhum e-mail é enviado


## FASE 13: Remover OAuth do Manus Completamente
- [x] Remover getLoginUrl() que redirecionava para OAuth Manus
- [x] Implementar getLoginUrl() que redireciona para /login local
- [x] Testar página de login - APENAS username + password
- [x] Testar página de registro - APENAS username + password
- [x] Verificar que não há mais redirecionamento para manus.im/app-auth


## FASE 14: Implementar Lista IPTV e Compra de Códigos
- [x] Adicionar campo iptvListUrl à tabela resellers
- [x] Adicionar campo codePrice à tabela resellers (preço do código)
- [x] Adicionar campo iptvListUrl à tabela customers
- [x] Criar Page 2 no painel de revendedor para gerenciar lista IPTV
- [x] Criar Page 2 no painel de cliente para gerenciar lista IPTV
- [x] Implementar compra de códigos com preço configurável
- [x] Implementar API Smart TV: validação de código + envio de lista IPTV
- [x] Mensagens de erro: "Código errado, verifique seu código ou entre em contato com o revendedor"
- [ ] Botão "Sair" no aplicativo Smart TV
- [x] Isolamento de painéis: revendedor vê apenas seus dados
- [x] Admin pode configurar preço de código por revendedor
- [ ] Clientes aparecem no painel do revendedor após usar código
