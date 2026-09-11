import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { JwtPayload, Usuario } from '../auth/auth.types';
import { PasswordService } from '../auth/password.service';
import {
  normalizeCnpj,
  normalizeCpf,
  normalizeEmail,
  normalizeMfaMethod,
  normalizeTelefone,
  normalizeUsuario,
  parseMfaMethods,
  validateStrongPassword,
} from '../auth/security.utils';
import { CsvDatabaseService } from '../csv-database/csv-database.service';

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

type Permissao = {
  PRM_ID: string;
  PRM_NOME: string;
  PRM_DESCRICAO: string;
};

type UsuarioEmpresaPapel = {
  UEP_ID: string;
  USU_ID: string;
  EMP_ID: string;
  PAP_ID: string;
};

type CreateUsuarioInput = {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  usuario?: string;
  senha?: string;
  papelId?: string;
};

type CreateEmpresaInput = {
  nome?: string;
  email?: string;
};

type CreatePapelInput = {
  nome?: string;
  descricao?: string;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly csv: CsvDatabaseService,
    private readonly passwordService: PasswordService,
  ) {}

  summary(user: JwtPayload) {
    const usuariosDaEmpresa = this.getUsuariosDaEmpresa(user.empresaId);

    return {
      empresaAtual: user.empresaNome,
      usuarios: usuariosDaEmpresa.length,
      empresas: this.isAdmin(user) ? this.csv.findAll('empresas').length : 1,
      papeis: this.isAdmin(user) ? this.csv.findAll('papeis').length : 1,
      permissoes: user.permissoes.length,
    };
  }

  usuarios(user: JwtPayload) {
    this.requirePermission(user, 'usuarios.ler');

    return this.getUsuariosDaEmpresa(user.empresaId);
  }

  async criarUsuario(user: JwtPayload, input: CreateUsuarioInput) {
    this.requirePermission(user, 'usuarios.criar');

    const nome = input.nome?.trim();
    const email = normalizeEmail(input.email);
    const telefone = normalizeTelefone(input.telefone);
    const cpf = normalizeCpf(input.cpf);
    const cnpj = normalizeCnpj(input.cnpj);
    const usuarioLogin = normalizeUsuario(input.usuario);
    const senha = input.senha?.trim();
    const papel = input.papelId ? this.findPapelOrFail(input.papelId) : this.findDefaultPapel();

    if (!nome || !email || !senha || !usuarioLogin) {
      throw new BadRequestException('Nome, e-mail, usuário e senha são obrigatórios');
    }

    const senhaErrors = validateStrongPassword(senha);

    if (senhaErrors.length > 0) {
      throw new BadRequestException(senhaErrors);
    }

    const novoUsuario: Usuario = {
      USU_ID: randomUUID(),
      USU_NOME: nome,
      USU_TELEFONE: telefone,
      USU_CPF: cpf,
      USU_CNPJ: cnpj,
      USU_USUARIO: usuarioLogin,
      USU_ACESSO: papel.PAP_NOME.toUpperCase(),
      USU_EMAIL: email,
      USU_SENHA_HASH: await this.passwordService.hash(senha),
      USU_ATIVO: '1',
      USU_MFA_ATIVO: '1',
      USU_MFA_METODOS: 'EMAIL|AUTHENTICATOR',
      USU_MFA_METODO_PADRAO: 'EMAIL',
      USU_TOTP_SECRET: this.generateTotpSecret(),
      USU_DEVE_TROCAR_SENHA: '0',
    };

    this.validateUniqueUserInCompany(novoUsuario, user.empresaId);

    this.csv.append('usuarios', novoUsuario);

    this.csv.append('usuarioEmpresaPapel', {
      UEP_ID: this.csv.nextNumericId('usuarioEmpresaPapel', 'UEP_ID'),
      USU_ID: novoUsuario.USU_ID,
      EMP_ID: user.empresaId,
      PAP_ID: papel.PAP_ID,
    });

    return this.mapUsuario(novoUsuario, user.empresaId);
  }

  empresas(user: JwtPayload) {
    this.requirePermission(user, 'empresas.ler');

    const empresas = this.csv.findAll<Empresa>('empresas');

    const filtradas = this.isAdmin(user)
      ? empresas
      : empresas.filter((empresa) => empresa.EMP_ID === user.empresaId);

    return filtradas.map((empresa) => ({
      id: empresa.EMP_ID,
      nome: empresa.EMP_NOME,
      email: empresa.EMP_EMAIL,
    }));
  }

  criarEmpresa(user: JwtPayload, input: CreateEmpresaInput) {
    this.requirePermission(user, 'empresas.criar');

    const nome = input.nome?.trim();
    const email = input.email?.trim().toLowerCase() || '';

    if (!nome) {
      throw new BadRequestException('Nome da empresa é obrigatório');
    }

    const novaEmpresa = {
      EMP_ID: randomUUID(),
      EMP_NOME: nome,
      EMP_EMAIL: email,
    };

    this.csv.append('empresas', novaEmpresa);

    return {
      id: novaEmpresa.EMP_ID,
      nome: novaEmpresa.EMP_NOME,
      email: novaEmpresa.EMP_EMAIL,
    };
  }

  papeis(user: JwtPayload) {
    this.requirePermission(user, 'papeis.ler');

    return this.csv.findAll<Papel>('papeis').map((papel) => ({
      id: papel.PAP_ID,
      nome: papel.PAP_NOME,
      descricao: papel.PAP_DESCRICAO,
    }));
  }

  criarPapel(user: JwtPayload, input: CreatePapelInput) {
    this.requirePermission(user, 'papeis.criar');

    const nome = input.nome?.trim();
    const descricao = input.descricao?.trim() || '';

    if (!nome) {
      throw new BadRequestException('Nome do papel é obrigatório');
    }

    const novoPapel = {
      PAP_ID: randomUUID(),
      PAP_NOME: nome,
      PAP_DESCRICAO: descricao,
    };

    this.csv.append('papeis', novoPapel);

    return {
      id: novoPapel.PAP_ID,
      nome: novoPapel.PAP_NOME,
      descricao: novoPapel.PAP_DESCRICAO,
    };
  }

  permissoes(user: JwtPayload) {
    this.requirePermission(user, 'permissoes.ler');

    return this.csv.findAll<Permissao>('permissoes').map((permissao) => ({
      id: permissao.PRM_ID,
      nome: permissao.PRM_NOME,
      descricao: permissao.PRM_DESCRICAO,
    }));
  }

  private getUsuariosDaEmpresa(empresaId: string) {
    const usuarios = this.csv.findAll<Usuario>('usuarios');
    const vinculos = this.csv.findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel');

    const idsDaEmpresa = vinculos
      .filter((vinculo) => vinculo.EMP_ID === empresaId)
      .map((vinculo) => vinculo.USU_ID);

    return usuarios
      .filter((usuario) => idsDaEmpresa.includes(usuario.USU_ID) && usuario.USU_ATIVO === '1')
      .map((usuario) => this.mapUsuario(usuario, empresaId));
  }

  private mapUsuario(usuario: Usuario, empresaId: string) {
    const vinculo = this.csv
      .findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel')
      .find((item) => item.USU_ID === usuario.USU_ID && item.EMP_ID === empresaId);

    const papel = vinculo ? this.findPapelOrFail(vinculo.PAP_ID) : null;

    return {
      id: usuario.USU_ID,
      nome: usuario.USU_NOME,
      telefone: usuario.USU_TELEFONE || '',
      cpf: usuario.USU_CPF || '',
      cnpj: usuario.USU_CNPJ || '',
      usuario: usuario.USU_USUARIO || '',
      acesso: papel?.PAP_NOME || usuario.USU_ACESSO,
      email: usuario.USU_EMAIL,
      ativo: usuario.USU_ATIVO === '1',
      mfaAtivo: usuario.USU_MFA_ATIVO !== '0',
      mfaMetodos: parseMfaMethods(usuario.USU_MFA_METODOS),
      mfaMetodoPadrao: normalizeMfaMethod(usuario.USU_MFA_METODO_PADRAO),
      deveTrocarSenha: usuario.USU_DEVE_TROCAR_SENHA === '1',
    };
  }

  private validateUniqueUserInCompany(usuarioNovo: Usuario, empresaId: string) {
    const usuarios = this.csv.findAll<Usuario>('usuarios');
    const vinculos = this.csv.findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel');

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

  private requirePermission(user: JwtPayload, permission: string) {
    if (!user.permissoes.includes(permission)) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso');
    }
  }

  private isAdmin(user: JwtPayload) {
    return user.papelNome.toLowerCase() === 'administrador';
  }

  private findPapelOrFail(papelId: string) {
    const papel = this.csv.findAll<Papel>('papeis').find((item) => item.PAP_ID === papelId);

    if (!papel) {
      throw new BadRequestException('Papel inválido');
    }

    return papel;
  }

  private findDefaultPapel() {
    const papeis = this.csv.findAll<Papel>('papeis');
    const papel = papeis.find((item) => item.PAP_NOME.toLowerCase() === 'revenda') || papeis[0];

    if (!papel) {
      throw new BadRequestException('Nenhum papel cadastrado');
    }

    return papel;
  }

  private generateTotpSecret() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = randomBytes(20);

    let output = '';

    for (const byte of bytes) {
      output += alphabet[byte % alphabet.length];
    }

    return output;
  }
}