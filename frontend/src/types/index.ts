export type MfaMethod = 'EMAIL' | 'AUTHENTICATOR';

export type Empresa = {
  id: string;
  nome: string;
  email: string;
};

export type Papel = {
  id: string;
  nome: string;
  descricao: string;
};

export type Usuario = {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
  cnpj: string;
  usuario: string;
  acesso: string;
  email: string;
  ativo: boolean;
  mfaAtivo: boolean;
  mfaMetodos?: MfaMethod[];
  mfaMetodoPadrao?: MfaMethod;
  deveTrocarSenha?: boolean;
  empresa: Empresa;
  papel: Papel;
  permissoes: string[];
};

export type UsuarioLista = {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
  cnpj: string;
  usuario: string;
  acesso: string;
  email: string;
  ativo: boolean;
  mfaAtivo: boolean;
  mfaMetodos?: MfaMethod[];
  mfaMetodoPadrao?: MfaMethod;
  deveTrocarSenha?: boolean;
};

export type Permissao = {
  id: string;
  nome: string;
  descricao: string;
};

export type DashboardSummary = {
  empresaAtual: string;
  usuarios: number;
  empresas: number;
  papeis: number;
  permissoes: number;
};

export type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
};

export type AuthOptions = {
  empresas: Empresa[];
};

export type LoginPayload = {
  empresaId: string;
  identificador: string;
  senha: string;
};

export type RegisterPayload = {
  empresaId: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  usuario: string;
  senha: string;
};

export type AuthSuccessResponse = {
  token: string;
  usuario: Usuario;
};

export type MfaMethodOption = {
  metodo: MfaMethod;
  label: string;
  destino: string;
};

export type MfaSessionResponse = {
  mfaRequired: true;
  mfaSessionId: string;
  expiresInSeconds: number;
  defaultMethod: MfaMethod;
  methods: MfaMethodOption[];
  mensagem: string;
};

export type MfaChallengeResponse = {
  mfaRequired: true;
  challengeId: string;
  expiresInSeconds: number;
  metodo: MfaMethod;
  metodoLabel: string;
  destino: string;
  mensagem: string;
};

export type AuthFlowResponse = AuthSuccessResponse | MfaSessionResponse;

export type RequestMfaPayload = {
  mfaSessionId: string;
  metodo: MfaMethod;
};

export type VerifyMfaPayload = {
  challengeId: string;
  codigo: string;
};

export type ChangePasswordRequiredPayload = {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
};

export type AuthenticatorSetupResponse = {
  issuer: string;
  accountName: string;
  secret: string;
  otpauthUrl: string;
};