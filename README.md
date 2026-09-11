# Polaryon — Portal de Parceiros

Portal multi-empresa (white-label) para gestão de acesso de parceiros: usuários, papéis e permissões, com autenticação em duas etapas e tema visual por empresa.

Projeto full-stack construído para praticar arquitetura de autenticação/autorização "de verdade" (rate limiting, MFA, RBAC) além do CRUD básico.

## Stack

**Frontend**
- Next.js 15 (App Router) + React 19 + TypeScript (`strict`)
- Tailwind CSS, com sistema de temas via CSS custom properties (claro/escuro + cor por empresa)

**Backend**
- NestJS 11 + TypeScript
- Autenticação JWT, validação de DTOs com `class-validator`
- Persistência em arquivos CSV (ver [Limitações conhecidas](#limitações-conhecidas--próximos-passos))

## Principais funcionalidades

- **Autenticação em duas etapas (MFA)**: código por e-mail ou aplicativo autenticador (TOTP), com sessão e tentativas de verificação com expiração.
- **Rate limiting de login**: bloqueio temporário por conta *e* por IP após tentativas malsucedidas.
- **Senhas com `scrypt`**: hash com salt aleatório e comparação em tempo constante (`timingSafeEqual`), evitando timing attacks.
- **RBAC (controle de acesso por permissão)**: usuários têm um papel por empresa, papéis agregam permissões (`usuarios.ler`, `empresas.criar` etc.), checadas tanto no backend (guards) quanto no frontend (menu e rotas).
- **Multi-empresa com tema white-label**: cada empresa (Macroex, Actus, Kamell, Atmos, Tohatsu) tem sua própria paleta de cores aplicada automaticamente no cabeçalho, rodapé e destaques.
- **Tema claro/escuro** persistente por usuário.
- **Política de senha forte** com bloqueio de senhas comuns.

## Estrutura do projeto

```
polaryon-portal/
├── frontend/   Next.js (App Router)
│   └── src/
│       ├── app/            rotas (login, cadastro, dashboard/*)
│       ├── components/     AppShell, DataTable, formulários, etc.
│       ├── contexts/       Auth, Theme, Notification
│       └── lib/            cliente HTTP (api.ts)
├── backend/    NestJS
│   └── src/
│       ├── auth/           login, MFA, rate limiting, hashing
│       ├── dashboard/      resumo do dashboard
│       ├── notifications/  notificações do usuário
│       └── csv-database/   camada de persistência em CSV
└── docs/
```

## Como rodar localmente

Pré-requisitos: Node.js 20+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite `backend/.env` e gere valores próprios para `JWT_SECRET` e `MFA_CODE_SECRET` (ex: `openssl rand -base64 32`). O envio de código MFA por e-mail (`SMTP_*`) só é necessário se você for testar o método **E-mail**; para testar sem configurar SMTP, use o método **Aplicativo autenticador (TOTP)** — o usuário semeado abaixo já vem com um segredo TOTP configurado.

```bash
npm run start:dev
```

O backend sobe em `http://localhost:3333` e, na primeira execução, cria a pasta `backend/data/` com os CSVs (incluindo um usuário administrador semeado por empresa).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O frontend sobe em `http://localhost:3050`.

### Usuário semeado

- Empresa: **Macroex**
- Usuário: `admin_macroex`
- MFA: e-mail (padrão) ou aplicativo autenticador (segredo já semeado em `CsvDatabaseService`)
- A senha do seed não fica em texto plano no código-fonte (só o hash `scrypt`) — defina a sua própria editando o seed em `backend/src/csv-database/csv-database.service.ts` e gerando um novo hash com `PasswordService.hash(...)`, ou apague `backend/data/` para recriar o seed do zero após ajustar o código.

## Limitações conhecidas / próximos passos

Este projeto prioriza mostrar arquitetura de autenticação/autorização; alguns pontos ficaram propositalmente simplificados:

- **Persistência em CSV** (`CsvDatabaseService`) em vez de um banco de dados real — funciona bem para demonstração, mas não é pensado para concorrência ou volume. Próximo passo natural: migrar para Postgres/SQLite via Prisma ou TypeORM, mantendo a mesma interface de serviço.
- **Rate limiting e sessões de MFA em memória** (`Map` no processo) — reiniciar o backend limpa bloqueios e desafios pendentes; para múltiplas instâncias, migraria para Redis.
- **Sem testes automatizados ainda** — é o próximo item da lista, começando pelo `PasswordService` e pelo `LoginSecurityService`.
- **Sem CI configurado** — pendente até a primeira versão versionada no Git.
