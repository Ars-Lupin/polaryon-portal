# Modelo de dados — Postgres + Prisma

O Polaryon usa Postgres com Prisma ORM. O schema fica em `backend/prisma/schema.prisma` e mantém os nomes das tabelas/colunas originais por compatibilidade com a modelagem de acesso.

## Tabelas

### ACESSO_USUARIO

- `USU_ID` — chave primária
- `USU_NOME`
- `USU_TELEFONE`
- `USU_CPF`
- `USU_CNPJ`
- `USU_USUARIO`
- `USU_ACESSO`
- `USU_EMAIL`
- `USU_SENHA_HASH`
- `USU_ATIVO` — boolean
- `USU_MFA_ATIVO` — boolean
- `USU_MFA_METODOS` — array de textos
- `USU_MFA_METODO_PADRAO`
- `USU_TOTP_SECRET`
- `USU_DEVE_TROCAR_SENHA` — boolean

### ACESSO_EMPRESA

- `EMP_ID` — chave primária
- `EMP_NOME`
- `EMP_EMAIL`

### ACESSO_PAPEL

- `PAP_ID` — chave primária
- `PAP_NOME`
- `PAP_DESCRICAO`

### ACESSO_PERMISSAO

- `PRM_ID` — chave primária
- `PRM_NOME` — único
- `PRM_DESCRICAO`

### ACESSO_USU_EMP_PAP

Relaciona usuário, empresa e papel. O id agora é autoincrementado pelo banco.

- `UEP_ID` — chave primária autoincremental
- `USU_ID` — FK para `ACESSO_USUARIO`
- `EMP_ID` — FK para `ACESSO_EMPRESA`
- `PAP_ID` — FK para `ACESSO_PAPEL`
- Índice único: `USU_ID + EMP_ID`

### ACESSO_PAP_PRM

Relaciona papéis e permissões. O id agora é autoincrementado pelo banco.

- `PPE_ID` — chave primária autoincremental
- `PRM_ID` — FK para `ACESSO_PERMISSAO`
- `PAP_ID` — FK para `ACESSO_PAPEL`
- Índice único: `PRM_ID + PAP_ID`

### NOTIFICACAO

Tabela para notificações do usuário.

- `NTF_ID` — chave primária
- `USU_ID` — FK para `ACESSO_USUARIO`
- `NTF_TITULO`
- `NTF_MENSAGEM`
- `NTF_LIDA` — boolean
- `NTF_DATA` — timestamp

### ACESSO_AUTH_LOG

Tabela de auditoria de autenticação.

- `LOG_ID` — chave primária
- `LOG_DATA` — timestamp
- `LOG_EVENTO`
- `USU_ID` — FK opcional para `ACESSO_USUARIO`
- `EMP_ID` — FK opcional para `ACESSO_EMPRESA`
- `IDENTIFICADOR`
- `IP`
- `SUCESSO` — boolean
- `MENSAGEM`

## Relações

- Uma empresa tem vários vínculos em `ACESSO_USU_EMP_PAP`.
- Um usuário pode ter vínculos com empresas por meio de `ACESSO_USU_EMP_PAP`.
- Um papel agrega permissões por meio de `ACESSO_PAP_PRM`.
- Notificações pertencem a um usuário.
- Logs de autenticação podem apontar para usuário e empresa, quando essa informação existe.
