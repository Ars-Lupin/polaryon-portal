# Correção do npm audit

## Frontend

```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
npm audit
npm run build
```

## Backend

```bash
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
npm audit
npm run build
```

Se estiver no PowerShell e algum arquivo não existir, o erro pode ser ignorado.
