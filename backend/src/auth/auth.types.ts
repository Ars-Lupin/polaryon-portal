import { Request } from 'express';

export type MfaMethod = 'EMAIL' | 'AUTHENTICATOR';

export type JwtPayload = {
  sub: string;
  email: string;
  acesso: string;
  nome: string;
  empresaId: string;
  empresaNome: string;
  papelId: string;
  papelNome: string;
  permissoes: string[];
};

export type Usuario = {
  USU_ID: string;
  USU_NOME: string;
  USU_TELEFONE?: string;
  USU_CPF?: string;
  USU_CNPJ?: string;
  USU_USUARIO?: string;
  USU_ACESSO: string;
  USU_EMAIL: string;
  USU_SENHA_HASH: string;
  USU_ATIVO: string;
  USU_MFA_ATIVO?: string;
  USU_MFA_METODOS?: string;
  USU_MFA_METODO_PADRAO?: string;
  USU_TOTP_SECRET?: string;
  USU_DEVE_TROCAR_SENHA?: string;
};

export type RequestWithUser = Request & {
  user: JwtPayload;
};