# Shancrys Frontend

Frontend React + TypeScript para a plataforma Shancrys - Landing page e área de gerenciamento de assinaturas.

## 🚀 Stack

- **React 19.1.1** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite 7.1.7** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

Os arquivos otimizados serão gerados em `dist/`

## 📄 Páginas

### Landing Page (`/`)

- Hero section com estatísticas
- Features showcase (BIM, 4D, Analytics, etc.)
- Pricing com 3 planos (Free, Pro, Enterprise)
- Call-to-action
- Footer com links

### Success Page (`/success`)

- Confirmação de pagamento
- Próximos passos
- Redirecionamento automático para dashboard

### Dashboard (`/dashboard`)

- Informações da assinatura atual
- Estatísticas de uso (projetos, usuários, storage)
- Histórico de faturas
- Gerenciamento: alterar plano, cancelar, reativar
- Link para Stripe Billing Portal

## 🔐 Autenticação

O frontend usa JWT Bearer tokens armazenados no `localStorage`.

O interceptor do Axios adiciona automaticamente o token em todas as requisições:

```typescript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## 💳 Fluxo de Checkout

1. Usuário clica em "Assinar Agora" na pricing page
2. Frontend chama `POST /api/billing/checkout`
3. Backend cria Stripe Checkout Session
4. Frontend redireciona para Stripe hosted checkout
5. Usuário completa pagamento
6. Stripe redireciona para `/success`
7. Webhook atualiza assinatura no backend

## 🎨 Componentes

### `components/Hero.tsx`

Hero section com gradient, headline, stats e CTAs

### `components/Features.tsx`

Grid de 6 features principais do produto

### `components/Pricing.tsx`

Tabela de preços com:

- Toggle Monthly/Yearly (desconto de 17%)
- 3 planos (Free, Pro, Enterprise)
- Lista de features por plano
- Botões de checkout

### `components/CTA.tsx`

Call-to-action final com botões

### `components/Footer.tsx`

Footer com links de navegação e redes sociais

## 🛠️ API Service

O arquivo `services/api.ts` exporta `billingApi` com métodos tipados:

```typescript
// Plans
billingApi.getPlans()
billingApi.getPlan(planId)

// Subscription
billingApi.getSubscription()
billingApi.createSubscription(planId, interval, trialDays?)
billingApi.cancelSubscription(immediately)
billingApi.reactivateSubscription()
billingApi.changePlan(newPlanId)

// Checkout & Portal
billingApi.createCheckout(planId, interval, successUrl, cancelUrl)
billingApi.createPortal(returnUrl)

// Invoices & Usage
billingApi.getInvoices(limit?)
billingApi.getUsage()
```

## 🎯 Próximos Passos

- [ ] Implementar autenticação completa (login/register)
- [ ] Adicionar página de projetos
- [ ] Implementar upload de modelos BIM
- [ ] Dashboard com métricas e analytics
- [ ] Página de configurações de conta
- [ ] Notificações e alertas
- [ ] Testes E2E com Playwright

## 📚 Documentação

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
