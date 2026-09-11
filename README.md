# Polaryon — Portal de Parceiros

Portal multi-empresa (white-label) para gestão de acesso de parceiros: usuários, papéis e permissões, com autenticação em duas etapas, tema visual por empresa e persistência em Postgres.

Projeto full-stack construído para praticar arquitetura de autenticação/autorização "de verdade" (rate limiting, MFA, RBAC) além do CRUD básico.

## Stack

**Frontend**
- Next.js 15 (App Router) + React 19 + TypeScript (`strict`)
- Tailwind CSS, com sistema de temas via CSS custom properties (claro/escuro + cor por empresa)
- Listagens com busca, paginação e consumo paginado da API

**Backend**
- NestJS 11 + TypeScript
- Autenticação JWT, validação de DTOs com `class-validator`
- Postgres + Prisma ORM
- Docker Compose para subir banco, backend e frontend juntos

## Principais funcionalidades

- **Autenticação em duas etapas (MFA)**: código por e-mail ou aplicativo autenticador (TOTP), com sessão e tentativas de verificação com expiração.
- **Rate limiting de login**: bloqueio temporário por conta *e* por IP após tentativas malsucedidas.
- **Senhas com `scrypt`**: hash com salt aleatório e comparação em tempo constante (`timingSafeEqual`), evitando timing attacks.
- **RBAC (controle de acesso por permissão)**: usuários têm um papel por empresa, papéis agregam permissões (`usuarios.ler`, `empresas.criar` etc.), checadas tanto no backend (guards) quanto no frontend (menu e rotas).
- **Multi-empresa com tema white-label**: cada empresa (Macroex, Actus, Kamell, Atmos, Tohatsu) tem sua própria paleta de cores aplicada automaticamente no cabeçalho, rodapé e destaques.
- **Busca e paginação** nas listagens de usuários e empresas.
- **Tema claro/escuro** persistente por usuário.
- **Política de senha forte** com bloqueio de senhas comuns.

## Estrutura do projeto

```
polaryon-portal/
├── docker-compose.yml
├── frontend/   Next.js (App Router)
│   └── src/
│       ├── app/            rotas (login, cadastro, dashboard/*)
│       ├── components/     AppShell, DataTable, Pagination, formulários, etc.
│       ├── contexts/       Auth, Theme, Notification
│       └── lib/            cliente HTTP (api.ts)
├── backend/    NestJS
│   ├── prisma/             schema, migrations e seed demo
│   └── src/
│       ├── auth/           login, MFA, rate limiting, hashing
│       ├── dashboard/      resumo e listagens paginadas
│       ├── database/       PrismaService + adaptador de persistência
│       └── notifications/  notificações do usuário
└── docs/
```

## Como rodar localmente

Pré-requisitos: Node.js 20+ e Docker.

### Opção rápida: Docker Compose

```bash
docker compose up --build
```

Serviços:
- Frontend: `http://localhost:3050`
- Backend: `http://localhost:3333`
- Postgres: `localhost:5432`

O backend aplica as migrations e executa o seed demo ao subir.

### Opção manual

Suba o banco:

```bash
docker compose up -d db
```

Configure e rode o backend:

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

Configure e rode o frontend em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Usuário semeado

- Empresa: **Macroex**
- Usuário: `admin_macroex`
- Senha inicial: `Admin@123456` (já vem pré-preenchida no formulário de login, só para facilitar testar o demo)
- MFA: e-mail (padrão) ou aplicativo autenticador
- Segredo TOTP semeado: `JBSWY3DPEHPK3PXP`

No primeiro login, o portal exige a troca dessa senha inicial antes de liberar o acesso ao dashboard (é o comportamento normal do seed, `deveTrocarSenha: true`). Para trocar a senha inicial do demo, gere um novo hash com `PasswordService.hash(...)`, atualize `adminPasswordHash` em `backend/prisma/seed.ts` e rode `npx prisma db seed` novamente.

## Limitações conhecidas / próximos passos

Este projeto prioriza mostrar arquitetura de autenticação/autorização; alguns pontos seguem propositalmente simplificados:

- **Rate limiting e sessões de MFA em memória** (`Map` no processo) — reiniciar o backend limpa bloqueios e desafios pendentes; para múltiplas instâncias, migraria para Redis.
- **Paginação já existe em usuários e empresas**; papéis e permissões ainda são listas simples porque o volume demo é pequeno.
- **Sem testes automatizados ainda** — é o próximo item da lista, começando pelo `PasswordService`, pelo `LoginSecurityService` e pelas consultas paginadas.
- **Sem CI configurado** — pendente até a primeira versão versionada no Git.
