# 💈 Inspire Barber Studio

> **Status do Projeto:** Em desenvolvimento focado em produção e hardening de segurança.

O **Inspire Barber Studio** é um sistema completo de agendamento e gerenciamento de equipe desenvolvido sob medida para suprir as necessidades reais da barbearia que frequento há mais de 8 anos. O projeto nasceu com o duplo propósito de entregar uma solução comercial de alto padrão para o estabelecimento e servir como um ambiente de estudo avançado.

A engenharia deste software foi guiada por um desafio técnico específico: **construir uma aplicação robusta utilizando uma stack de linguagens não dominantes no meu dia a dia profissional**, aprimorando profundamente meus conhecimentos em ecossistemas modernos de desenvolvimento web e explorando o teto de eficiência na **cocriação de aplicações auxiliadas por Inteligência Artificial**.

---

## 🎯 Objetivos de Estudo & Abordagem com IA

*   **Exploração de Ecossistema Não Dominante:** Desenvolvimento focado em sair da zona de conforto profissional, dominando o fluxo assíncrono, renderização híbrida e tipagem estrita no ecossistema do ecossistema JavaScript/TypeScript.
*   **Cocriação Avançada com IA:** Utilização estratégica de agentes de IA (como Claude Code) não apenas para geração de trechos isolados de código, mas para automação de refatorações complexas, auditorias de design e revisões de segurança em tempo real, documentando o comportamento de engenharia de prompts voltados à resiliência de software.

---

## 🛠️ Stack Tecnológica & Arquitetura Profunda

O projeto adota uma arquitetura descentralizada e moderna, priorizando a experiência do usuário em dispositivos móveis (*Mobile-First*) e o tráfego seguro de dados.

### Frontend & Interface (UI/UX Premium)
*   **Next.js (App Router):** Arquitetura baseada em rotas dinâmicas e otimização de renderização. O fluxo administrativo utiliza rotas protegidas em nível de servidor, enquanto o fluxo do cliente adota componentes de renderização dinâmica para reações instantâneas em tela.
*   **Tailwind CSS:** Design System customizado seguindo uma estética *Editorial Dark*. Rompemos o grid tradicional de IA para entregar um layout assimétrico, tipografia híbrida marcante (Serif para títulos de impacto e Mono/Sans para dados técnicos) e transições fluidas.
*   **Framer Motion & Embla Carousel:** Implementação de micro-interações orgânicas, áreas de toque anatômicas ajustadas para o polegar e carrosséis horizontais com suporte a gestos de arrastar (*swipe/scroll* natural de aplicativos nativos).

### Backend & Storage (BaaS)
*   **Supabase:** Utilizado como o coração da infraestrutura de dados (Backend-as-a-Service).
    *   **PostgreSQL:** Banco de dados relacional que gerencia com consistência as tabelas de `profissionais` e `agendamentos`.
    *   **Supabase Storage:** Armazenamento em nuvem configurado com um *Bucket* público otimizado (`barbeiros-fotos`) para o upload de avatares dos profissionais em tempo real diretamente pelo painel administrativo.

---

## 🔐 A Barreira de Ouro: Engenharia de Segurança & Hardening

Seguindo os princípios de **"Zero Trust"**, **"Secure by Default"** e as diretrizes do **OWASP Top 10**, o projeto passou por uma auditoria rígida para mitigar vulnerabilidades clássicas da web:

### 1. Autenticação & Privacidade de Cadeira (RBAC)
*   **Sessões Protegidas com Cookies HttpOnly:** O login de profissionais abandona o uso inseguro de `localStorage`. Ao autenticar e-mail e senha, o servidor gera e assina um JWT utilizando a biblioteca `jose` (Web Crypto API), injetando um cookie estruturado com as diretivas `HttpOnly`, `Secure`, `SameSite=Strict` e `Path=/`. Isso neutraliza completamente ataques de roubo de sessão via XSS.
*   **Middleware de Intercepção Rígido:** Um arquivo `middleware.ts` intercepta todas as requisições para `/admin/:barbeiro*`. Ele descriptografa o JWT em nível de borda (*Edge*) e valida o controle de acesso baseado em funções (RBAC). Profissionais com a role `BARBER` ficam restritos estritamente ao seu próprio *slug* de atendimento. Apenas usuários com a role `OWNER` (Pablo) possuem permissão para transitar livremente e gerenciar a equipe.

### 2. Proteção contra Abusos e Automação
*   **Honeypot Antispam:** Os formulários críticos (Login e Agendamento) possuem inputs camuflados invisíveis para humanos (`absolute opacity-0 pointer-events-none`). Caso robôs ou scripts de automação tentem varrer a página e preencher esses campos programaticamente, a requisição é abortada na hora, mitigando tentativas de força bruta e scraping.
*   **Prevenção contra IDOR & SQLi:** Todas as consultas ao Supabase utilizam os métodos parametrizados do SDK nativo, blindando o sistema contra SQL Injection. As queries de agendamento não confiam em IDs enviados pelo cliente; elas cruzam obrigatoriamente os dados com o ID contido no token criptografado da sessão.

### 3. Resiliência de Software e UX Mobile
*   **Tratamento de Erros Nível C3:** Chamadas ao banco de dados são envelopadas em estruturas assíncronas de `try/catch` com tratamento de estado visual (`isLoading`). Se a conexão oscilar no 4G do cliente, o sistema exibe fallbacks elegantes em vez de quebrar a interface ou expor *Stack Traces* internos do PostgreSQL.
*   **Ajuste de Zoom de Teclado (iOS):** Inputs de texto configurados com tamanho mínimo de `text-base` (16px) para impedir o comportamento nativo do iOS de forçar zoom na tela ao abrir o teclado, mantendo o layout intacto.

---

## ⚙️ Funcionalidades Implementadas

*   [x] **Landing Page Premium:** Layout de alto padrão focado na conversão e na identidade visual do estúdio.
*   [x] **Fluxo de Agendamento Dinâmico:** Seleção de serviços, barbeiros integrados ao banco de dados e grade de horários em tempo real (com bloqueio automático de horários ocupados).
*   [x] **CRUD Completo de Equipe (Painel do Owner):** Interface administrativa centralizada onde o proprietário pode Cadastrar, Editar (incluindo upload de foto de perfil e alternação de visibilidade de senha) e Remover profissionais do sistema.
*   [x] **Segurança de Rotas via Middleware:** Controle estrito de sessões por cookies criptografados.

---

## 🚀 Como Executar o Projeto Localmente

1. **Acesse a url:https://inspire-barber-studio-pklcvb8bp-lucas-perez-s-projects.vercel.app/**

2. **Clone o repositório:**
```bash
   git clone [https://github.com/LucasPerezAlves/Inspire-Barber-Studio.git](https://github.com/LucasPerezAlves/Inspire-Barber-Studio.git)
   cd Inspire-Barber-Studio
