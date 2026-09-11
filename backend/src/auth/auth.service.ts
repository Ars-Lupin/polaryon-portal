import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestMfaDto } from './dto/request-mfa.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { ChangePasswordRequiredDto } from './dto/change-password-required.dto';
import { JwtPayload, Usuario } from './auth.types';
import { LoginSecurityService } from './login-security.service';
import { MfaService } from './mfa.service';
import { PasswordService } from './password.service';
import {
  maskIdentifier,
  normalizeCnpj,
  normalizeCpf,
  normalizeEmail,
  normalizeIdentifier,
  normalizeMfaMethod,
  normalizeTelefone,
  normalizeUsuario,
  validateStrongPassword,
} from './security.utils';

type Empresa = {
  EMP_ID: string;
  EMP_NOME: string;
  EMP_EMAIL: string;
};

type Papel = {
  PAP_ID: string;
  PAP_NOME: string;
  PAP_DESCRICAO: string;
};

type UsuarioEmpresaPapel = {
  UEP_ID: string;
  USU_ID: string;
  EMP_ID: string;
  PAP_ID: string;
};

type Permissao = {
  PRM_ID: string;
  PRM_NOME: string;
  PRM_DESCRICAO: string;
};

type PapelPermissao = {
  PPE_ID: string;
  PRM_ID: string;
  PAP_ID: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly loginSecurity: LoginSecurityService,
    private readonly mfaService: MfaService,
  ) {}

  async options() {
    return {
      empresas: (await this.database.findAll<Empresa>('empresas')).map((empresa) => ({
        id: empresa.EMP_ID,
        nome: empresa.EMP_NOME,
        email: empresa.EMP_EMAIL,
      })),
    };
  }

  async register(dto: RegisterDto, ip: string) {
    const senhaErrors = validateStrongPassword(dto.senha);

    if (senhaErrors.length > 0) {
      throw new BadRequestException(senhaErrors);
    }

    const empresaId = dto.empresaId.trim();
    const empresa = await this.findEmpresaOrFail(empresaId);
    const papelRevenda = await this.findDefaultPapel();

    const novoUsuario: Usuario = {
      USU_ID: randomUUID(),
      USU_NOME: dto.nome.trim(),
      USU_EMAIL: normalizeEmail(dto.email),
      USU_TELEFONE: normalizeTelefone(dto.telefone),
      USU_CPF: normalizeCpf(dto.cpf),
      USU_CNPJ: normalizeCnpj(dto.cnpj),
      USU_USUARIO: normalizeUsuario(dto.usuario),
      USU_ACESSO: papelRevenda.PAP_NOME.toUpperCase(),
      USU_SENHA_HASH: await this.passwordService.hash(dto.senha),
      USU_ATIVO: '1',
      USU_MFA_ATIVO: '1',
      USU_MFA_METODOS: 'EMAIL|AUTHENTICATOR',
      USU_MFA_METODO_PADRAO: 'EMAIL',
      USU_TOTP_SECRET: this.mfaService.generateTotpSecret(),
      USU_DEVE_TROCAR_SENHA: '0',
    };

    await this.validateUniqueUserInCompany(novoUsuario, empresa.EMP_ID);

    await this.database.append('usuarios', novoUsuario);

    await this.database.append('usuarioEmpresaPapel', {
      USU_ID: novoUsuario.USU_ID,
      EMP_ID: empresa.EMP_ID,
      PAP_ID: papelRevenda.PAP_ID,
    });

    await this.audit({
      evento: 'REGISTER',
      userId: novoUsuario.USU_ID,
      empresaId: empresa.EMP_ID,
      identificador: novoUsuario.USU_EMAIL,
      ip,
      sucesso: true,
      mensagem: 'Usuário cadastrado',
    });

    return this.startMfaOrReturnToken(novoUsuario, empresa.EMP_ID, papelRevenda.PAP_ID, ip);
  }

  async login(dto: LoginDto, ip: string) {
    const empresaId = dto.empresaId.trim();
    const identificador = normalizeIdentifier(dto.identificador);
    const accountKey = this.loginSecurity.buildAccountKey(empresaId, identificador);

    if (this.loginSecurity.isBlocked(accountKey, ip)) {
      await this.audit({
        evento: 'LOGIN_BLOCKED',
        empresaId,
        identificador: maskIdentifier(dto.identificador),
        ip,
        sucesso: false,
        mensagem: 'Tentativas excedidas',
      });

      throw new UnauthorizedException('Credenciais inválidas ou temporariamente bloqueadas');
    }

    const empresa = (await this.database
      .findAll<Empresa>('empresas'))
      .find((item) => item.EMP_ID === empresaId);

    if (!empresa) {
      this.loginSecurity.recordFailure(accountKey, ip);

      await this.audit({
        evento: 'LOGIN_FAILED',
        empresaId,
        identificador: maskIdentifier(dto.identificador),
        ip,
        sucesso: false,
        mensagem: 'Empresa inválida',
      });

      throw new UnauthorizedException('Credenciais inválidas');
    }

    const usuario = await this.findUserByIdentifierInCompany(empresa.EMP_ID, identificador);

    if (!usuario) {
      this.loginSecurity.recordFailure(accountKey, ip);

      await this.audit({
        evento: 'LOGIN_FAILED',
        empresaId: empresa.EMP_ID,
        identificador: maskIdentifier(dto.identificador),
        ip,
        sucesso: false,
        mensagem: 'Identificador não encontrado ou sem vínculo com a empresa',
      });

      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordOk = await this.passwordService.verify(dto.senha, usuario.USU_SENHA_HASH);

    if (!passwordOk) {
      this.loginSecurity.recordFailure(accountKey, ip);

      await this.audit({
        evento: 'LOGIN_FAILED',
        userId: usuario.USU_ID,
        empresaId: empresa.EMP_ID,
        identificador: maskIdentifier(dto.identificador),
        ip,
        sucesso: false,
        mensagem: 'Senha inválida',
      });

      throw new UnauthorizedException('Credenciais inválidas');
    }

    const vinculo = await this.findVinculoOrFail(usuario.USU_ID, empresa.EMP_ID);

    this.loginSecurity.recordSuccess(accountKey, ip);

    await this.audit({
      evento: 'LOGIN_PASSWORD_OK',
      userId: usuario.USU_ID,
      empresaId: empresa.EMP_ID,
      identificador: maskIdentifier(dto.identificador),
      ip,
      sucesso: true,
      mensagem: 'Senha validada, aguardando escolha do MFA',
    });

    return this.startMfaOrReturnToken(usuario, empresa.EMP_ID, vinculo.PAP_ID, ip);
  }

  async requestMfa(dto: RequestMfaDto, ip: string) {
    const method = normalizeMfaMethod(dto.metodo);
    const session = this.loginSecurity.getMfaSessionOrThrow(dto.mfaSessionId);

    if (!session.methods.includes(method)) {
      throw new BadRequestException('Método MFA não disponível para este usuário');
    }

    const usuario = await this.findUsuarioAtivoOrFail(session.userId);

    if (method === 'AUTHENTICATOR') {
      const challenge = this.loginSecurity.createMfaChallenge({
        mfaSessionId: session.mfaSessionId,
        userId: session.userId,
        empresaId: session.empresaId,
        papelId: session.papelId,
        method,
      });

      await this.audit({
        evento: 'MFA_AUTHENTICATOR_REQUESTED',
        userId: usuario.USU_ID,
        empresaId: session.empresaId,
        identificador: usuario.USU_EMAIL,
        ip,
        sucesso: true,
        mensagem: 'MFA por aplicativo autenticador solicitado',
      });

      return {
        mfaRequired: true,
        challengeId: challenge.challengeId,
        expiresInSeconds: challenge.expiresInSeconds,
        metodo: method,
        metodoLabel: this.mfaService.getMethodLabel(method),
        destino: this.mfaService.getDestination(method, usuario),
        mensagem: 'Informe o código do seu aplicativo autenticador',
      };
    }

    const code = this.mfaService.generateCode();
    const expiresInSeconds = 300;

    const delivery = await this.mfaService.sendCode({
      method,
      usuario,
      code,
      empresaId: session.empresaId,
      expiresInSeconds,
    });

    const challenge = this.loginSecurity.createMfaChallenge({
      mfaSessionId: session.mfaSessionId,
      userId: session.userId,
      empresaId: session.empresaId,
      papelId: session.papelId,
      method,
      code,
    });

    await this.audit({
      evento: 'MFA_EMAIL_REQUESTED',
      userId: usuario.USU_ID,
      empresaId: session.empresaId,
      identificador: usuario.USU_EMAIL,
      ip,
      sucesso: true,
      mensagem: 'MFA por e-mail solicitado',
    });

    return {
      mfaRequired: true,
      challengeId: challenge.challengeId,
      expiresInSeconds: challenge.expiresInSeconds,
      metodo: method,
      metodoLabel: this.mfaService.getMethodLabel(method),
      destino: delivery.destino,
      mensagem: delivery.mensagem,
    };
  }

  async verifyMfa(dto: VerifyMfaDto, ip: string) {
    const challenge = this.loginSecurity.readMfaChallengeOrThrow(dto.challengeId);
    const usuario = await this.findUsuarioAtivoOrFail(challenge.userId);

    let authenticatorValid = false;

    if (challenge.method === 'AUTHENTICATOR') {
      authenticatorValid = this.mfaService.verifyTotp(
        usuario.USU_TOTP_SECRET || '',
        dto.codigo,
      );
    }

    const verified = this.loginSecurity.verifyMfaChallenge(dto.challengeId, dto.codigo, {
      authenticatorValid,
    });

    await this.findEmpresaOrFail(verified.empresaId);
    await this.findPapelOrFail(verified.papelId);

    await this.audit({
      evento: 'MFA_SUCCESS',
      userId: usuario.USU_ID,
      empresaId: verified.empresaId,
      identificador: usuario.USU_EMAIL,
      ip,
      sucesso: true,
      mensagem: `MFA validado por ${verified.method}`,
    });

    return this.buildAuthResponse(usuario, verified.empresaId, verified.papelId);
  }

  async changePasswordRequired(
    user: JwtPayload,
    dto: ChangePasswordRequiredDto,
    ip: string,
  ) {
    const senhaAtual = String(dto.senhaAtual || '').trim();
    const novaSenha = String(dto.novaSenha || '').trim();
    const confirmarNovaSenha = String(dto.confirmarNovaSenha || '').trim();

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      throw new BadRequestException('Preencha todos os campos');
    }

    if (novaSenha !== confirmarNovaSenha) {
      throw new BadRequestException('A confirmação da nova senha não confere');
    }

    if (senhaAtual === novaSenha) {
      throw new BadRequestException('A nova senha não pode ser igual à senha atual');
    }

    const senhaErrors = validateStrongPassword(novaSenha);

    if (senhaErrors.length > 0) {
      throw new BadRequestException(senhaErrors);
    }

    const usuarios = await this.database.findAll<Usuario>('usuarios');
    const index = usuarios.findIndex(
      (usuario) => usuario.USU_ID === user.sub && usuario.USU_ATIVO === '1',
    );

    if (index < 0) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const usuario = usuarios[index];

    const senhaAtualOk = await this.passwordService.verify(
      senhaAtual,
      usuario.USU_SENHA_HASH,
    );

    if (!senhaAtualOk) {
      await this.audit({
        evento: 'CHANGE_PASSWORD_FAILED',
        userId: usuario.USU_ID,
        empresaId: user.empresaId,
        identificador: usuario.USU_EMAIL,
        ip,
        sucesso: false,
        mensagem: 'Senha atual inválida',
      });

      throw new UnauthorizedException('Senha atual inválida');
    }

    const novaSenhaIgualHashAtual = await this.passwordService.verify(
      novaSenha,
      usuario.USU_SENHA_HASH,
    );

    if (novaSenhaIgualHashAtual) {
      throw new BadRequestException('A nova senha não pode ser igual à senha atual');
    }

    const usuarioAtualizado: Usuario = {
      ...usuario,
      USU_SENHA_HASH: await this.passwordService.hash(novaSenha),
      USU_DEVE_TROCAR_SENHA: '0',
    };

    usuarios[index] = usuarioAtualizado;

    await this.database.saveAll('usuarios', usuarios);

    await this.audit({
      evento: 'CHANGE_PASSWORD_SUCCESS',
      userId: usuarioAtualizado.USU_ID,
      empresaId: user.empresaId,
      identificador: usuarioAtualizado.USU_EMAIL,
      ip,
      sucesso: true,
      mensagem: 'Senha alterada com sucesso',
    });

    return this.buildAuthResponse(
      usuarioAtualizado,
      user.empresaId,
      user.papelId,
    );
  }

  async profile(userId: string, empresaId: string, papelId: string) {
    const usuario = await this.findUsuarioAtivoOrFail(userId);

    return this.sanitize(usuario, empresaId, papelId);
  }

  async getAuthenticatorSetup(userId: string) {
    const usuario = await this.findUsuarioAtivoOrFail(userId);

    if (!usuario.USU_TOTP_SECRET) {
      throw new BadRequestException('Usuário sem secret configurado para authenticator');
    }

    return this.mfaService.getAuthenticatorSetup(usuario);
  }

  private async startMfaOrReturnToken(
    usuario: Usuario,
    empresaId: string,
    papelId: string,
    ip: string,
  ) {
    const mfaAtivo = usuario.USU_MFA_ATIVO !== '0';

    if (!mfaAtivo) {
      return this.buildAuthResponse(usuario, empresaId, papelId);
    }

    const methods = this.mfaService.getAvailableMethods(usuario);

    if (methods.length === 0) {
      return this.buildAuthResponse(usuario, empresaId, papelId);
    }

    const session = this.loginSecurity.createMfaSession({
      userId: usuario.USU_ID,
      empresaId,
      papelId,
      methods,
    });

    const defaultMethod = this.mfaService.getDefaultMethod(usuario);

    await this.audit({
      evento: 'MFA_SESSION_CREATED',
      userId: usuario.USU_ID,
      empresaId,
      identificador: usuario.USU_EMAIL,
      ip,
      sucesso: true,
      mensagem: 'Sessão MFA criada para escolha do método',
    });

    return {
      mfaRequired: true,
      mfaSessionId: session.mfaSessionId,
      expiresInSeconds: session.expiresInSeconds,
      defaultMethod,
      methods: methods.map((method) => ({
        metodo: method,
        label: this.mfaService.getMethodLabel(method),
        destino: this.mfaService.getDestination(method, usuario),
      })),
      mensagem: 'Escolha o método de autenticação em duas etapas',
    };
  }

  private async buildAuthResponse(usuario: Usuario, empresaId: string, papelId: string) {
    const usuarioSeguro = await this.sanitize(usuario, empresaId, papelId);

    const payload: JwtPayload = {
      sub: usuario.USU_ID,
      email: usuario.USU_EMAIL,
      acesso: usuarioSeguro.acesso,
      nome: usuario.USU_NOME,
      empresaId: usuarioSeguro.empresa.id,
      empresaNome: usuarioSeguro.empresa.nome,
      papelId: usuarioSeguro.papel.id,
      papelNome: usuarioSeguro.papel.nome,
      permissoes: usuarioSeguro.permissoes,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      usuario: usuarioSeguro,
    };
  }

  private async sanitize(usuario: Usuario, empresaId: string, papelId: string) {
    const empresa = await this.findEmpresaOrFail(empresaId);
    const papel = await this.findPapelOrFail(papelId);
    const permissoes = await this.getPermissoesByPapel(papelId);
    const mfaMethods = this.mfaService.getAvailableMethods(usuario);

    return {
      id: usuario.USU_ID,
      nome: usuario.USU_NOME,
      telefone: usuario.USU_TELEFONE || '',
      cpf: usuario.USU_CPF || '',
      cnpj: usuario.USU_CNPJ || '',
      usuario: usuario.USU_USUARIO || '',
      acesso: papel.PAP_NOME,
      email: usuario.USU_EMAIL,
      ativo: usuario.USU_ATIVO === '1',
      mfaAtivo: usuario.USU_MFA_ATIVO !== '0',
      mfaMetodos: mfaMethods,
      mfaMetodoPadrao: this.mfaService.getDefaultMethod(usuario),
      deveTrocarSenha: usuario.USU_DEVE_TROCAR_SENHA === '1',
      empresa: {
        id: empresa.EMP_ID,
        nome: empresa.EMP_NOME,
        email: empresa.EMP_EMAIL,
      },
      papel: {
        id: papel.PAP_ID,
        nome: papel.PAP_NOME,
        descricao: papel.PAP_DESCRICAO,
      },
      permissoes,
    };
  }

  private async findUserByIdentifierInCompany(
    empresaId: string,
    identificadorNormalizado: string,
  ) {
    const usuarios = await this.database.findAll<Usuario>('usuarios');
    const vinculos = await this.database.findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel');

    const idsDaEmpresa = vinculos
      .filter((vinculo) => vinculo.EMP_ID === empresaId)
      .map((vinculo) => vinculo.USU_ID);

    return usuarios.find((usuario) => {
      if (!idsDaEmpresa.includes(usuario.USU_ID)) {
        return false;
      }

      if (usuario.USU_ATIVO !== '1') {
        return false;
      }

      const identifiers = [
        normalizeEmail(usuario.USU_EMAIL),
        normalizeTelefone(usuario.USU_TELEFONE),
        normalizeCpf(usuario.USU_CPF),
        normalizeCnpj(usuario.USU_CNPJ),
        normalizeUsuario(usuario.USU_USUARIO),
      ].filter(Boolean);

      return identifiers.includes(identificadorNormalizado);
    });
  }

  private async validateUniqueUserInCompany(usuarioNovo: Usuario, empresaId: string) {
    const usuarios = await this.database.findAll<Usuario>('usuarios');
    const vinculos = await this.database.findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel');

    const idsDaEmpresa = vinculos
      .filter((vinculo) => vinculo.EMP_ID === empresaId)
      .map((vinculo) => vinculo.USU_ID);

    const identifiersNovo = [
      normalizeEmail(usuarioNovo.USU_EMAIL),
      normalizeTelefone(usuarioNovo.USU_TELEFONE),
      normalizeCpf(usuarioNovo.USU_CPF),
      normalizeCnpj(usuarioNovo.USU_CNPJ),
      normalizeUsuario(usuarioNovo.USU_USUARIO),
    ].filter(Boolean);

    const duplicated = usuarios.some((usuario) => {
      if (!idsDaEmpresa.includes(usuario.USU_ID)) {
        return false;
      }

      if (usuario.USU_ATIVO !== '1') {
        return false;
      }

      const identifiersAtual = [
        normalizeEmail(usuario.USU_EMAIL),
        normalizeTelefone(usuario.USU_TELEFONE),
        normalizeCpf(usuario.USU_CPF),
        normalizeCnpj(usuario.USU_CNPJ),
        normalizeUsuario(usuario.USU_USUARIO),
      ].filter(Boolean);

      return identifiersAtual.some((identifier) => identifiersNovo.includes(identifier));
    });

    if (duplicated) {
      throw new BadRequestException(
        'E-mail, telefone, CPF, CNPJ ou usuário já cadastrado para esta empresa',
      );
    }
  }

  private async findUsuarioAtivoOrFail(userId: string) {
    const usuario = (await this.database
      .findAll<Usuario>('usuarios'))
      .find((item) => item.USU_ID === userId && item.USU_ATIVO === '1');

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return usuario;
  }

  private async findEmpresaOrFail(empresaId: string) {
    const empresa = (await this.database
      .findAll<Empresa>('empresas'))
      .find((item) => item.EMP_ID === empresaId);

    if (!empresa) {
      throw new BadRequestException('Empresa inválida');
    }

    return empresa;
  }

  private async findPapelOrFail(papelId: string) {
    const papel = (await this.database.findAll<Papel>('papeis')).find(
      (item) => item.PAP_ID === papelId,
    );

    if (!papel) {
      throw new BadRequestException('Papel inválido');
    }

    return papel;
  }

  private async findDefaultPapel() {
    const papeis = await this.database.findAll<Papel>('papeis');
    const papel = papeis.find((item) => item.PAP_NOME.toLowerCase() === 'revenda') || papeis[0];

    if (!papel) {
      throw new BadRequestException('Nenhum papel cadastrado');
    }

    return papel;
  }

  private async findVinculoOrFail(userId: string, empresaId: string) {
    const vinculo = (await this.database
      .findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel'))
      .find((item) => item.USU_ID === userId && item.EMP_ID === empresaId);

    if (!vinculo) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return vinculo;
  }

  private async getPermissoesByPapel(papelId: string) {
    const relacoes = await this.database.findAll<PapelPermissao>('papelPermissao');
    const permissoes = await this.database.findAll<Permissao>('permissoes');
    const ids = relacoes.filter((item) => item.PAP_ID === papelId).map((item) => item.PRM_ID);

    return permissoes
      .filter((item) => ids.includes(item.PRM_ID))
      .map((item) => item.PRM_NOME);
  }

  private async audit(params: {
    evento: string;
    userId?: string;
    empresaId?: string;
    identificador?: string;
    ip?: string;
    sucesso: boolean;
    mensagem: string;
  }) {
    try {
      await this.database.append('authLogs', {
        LOG_ID: randomUUID(),
        LOG_DATA: new Date().toISOString(),
        LOG_EVENTO: params.evento,
        USU_ID: params.userId || '',
        EMP_ID: params.empresaId || '',
        IDENTIFICADOR: params.identificador || '',
        IP: params.ip || '',
        SUCESSO: params.sucesso ? '1' : '0',
        MENSAGEM: params.mensagem,
      });
    } catch {
      // Não derruba a autenticação se o log falhar.
    }
  }
}
