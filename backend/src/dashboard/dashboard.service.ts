import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
import { DatabaseService } from '../database/database.service';
import { PrismaService } from '../database/prisma.service';

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

export type PaginationQuery = {
  page?: string;
  pageSize?: string;
  q?: string;
};

type UsuarioComPapel = Prisma.UsuarioGetPayload<{
  include: {
    empresaPapeis: {
      include: {
        papel: true;
      };
    };
  };
}>;

@Injectable()
export class DashboardService {
  constructor(
    private readonly database: DatabaseService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async summary(user: JwtPayload) {
    const [usuarios, empresas, papeis] = await Promise.all([
      this.getUsuariosDaEmpresa(user.empresaId),
      this.isAdmin(user) ? this.prisma.empresa.count() : Promise.resolve(1),
      this.isAdmin(user) ? this.prisma.papel.count() : Promise.resolve(1),
    ]);

    return {
      empresaAtual: user.empresaNome,
      usuarios: usuarios.length,
      empresas,
      papeis,
      permissoes: user.permissoes.length,
    };
  }

  async usuarios(user: JwtPayload, query: PaginationQuery = {}) {
    this.requirePermission(user, 'usuarios.ler');

    const { page, pageSize, search } = this.parsePagination(query);
    const where: Prisma.UsuarioWhereInput = {
      ativo: true,
      empresaPapeis: {
        some: {
          empresaId: user.empresaId,
        },
      },
    };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { usuario: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, usuarios] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: 'asc' },
        include: {
          empresaPapeis: {
            where: { empresaId: user.empresaId },
            include: { papel: true },
          },
        },
      }),
    ]);

    return {
      data: usuarios.map((usuario) => this.mapUsuarioRecord(usuario)),
      total,
      page,
      pageSize,
    };
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
    const papel = input.papelId
      ? await this.findPapelOrFail(input.papelId)
      : await this.findDefaultPapel();

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

    await this.validateUniqueUserInCompany(novoUsuario, user.empresaId);

    await this.database.append('usuarios', novoUsuario);

    await this.database.append('usuarioEmpresaPapel', {
      USU_ID: novoUsuario.USU_ID,
      EMP_ID: user.empresaId,
      PAP_ID: papel.PAP_ID,
    });

    return this.mapUsuario(novoUsuario, user.empresaId);
  }

  async empresas(user: JwtPayload, query: PaginationQuery = {}) {
    this.requirePermission(user, 'empresas.ler');

    const { page, pageSize, search } = this.parsePagination(query);
    const where: Prisma.EmpresaWhereInput = this.isAdmin(user) ? {} : { id: user.empresaId };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, empresas] = await this.prisma.$transaction([
      this.prisma.empresa.count({ where }),
      this.prisma.empresa.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      data: empresas.map((empresa) => ({
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
      })),
      total,
      page,
      pageSize,
    };
  }

  async criarEmpresa(user: JwtPayload, input: CreateEmpresaInput) {
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

    await this.database.append('empresas', novaEmpresa);

    return {
      id: novaEmpresa.EMP_ID,
      nome: novaEmpresa.EMP_NOME,
      email: novaEmpresa.EMP_EMAIL,
    };
  }

  async papeis(user: JwtPayload) {
    this.requirePermission(user, 'papeis.ler');

    return (await this.database.findAll<Papel>('papeis')).map((papel) => ({
      id: papel.PAP_ID,
      nome: papel.PAP_NOME,
      descricao: papel.PAP_DESCRICAO,
    }));
  }

  async criarPapel(user: JwtPayload, input: CreatePapelInput) {
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

    await this.database.append('papeis', novoPapel);

    return {
      id: novoPapel.PAP_ID,
      nome: novoPapel.PAP_NOME,
      descricao: novoPapel.PAP_DESCRICAO,
    };
  }

  async permissoes(user: JwtPayload) {
    this.requirePermission(user, 'permissoes.ler');

    return (await this.database.findAll<Permissao>('permissoes')).map((permissao) => ({
      id: permissao.PRM_ID,
      nome: permissao.PRM_NOME,
      descricao: permissao.PRM_DESCRICAO,
    }));
  }

  private async getUsuariosDaEmpresa(empresaId: string) {
    const usuarios = await this.database.findAll<Usuario>('usuarios');
    const vinculos = await this.database.findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel');

    const idsDaEmpresa = vinculos
      .filter((vinculo) => vinculo.EMP_ID === empresaId)
      .map((vinculo) => vinculo.USU_ID);

    return Promise.all(
      usuarios
        .filter((usuario) => idsDaEmpresa.includes(usuario.USU_ID) && usuario.USU_ATIVO === '1')
        .map((usuario) => this.mapUsuario(usuario, empresaId)),
    );
  }

  private async mapUsuario(usuario: Usuario, empresaId: string) {
    const vinculo = (await this.database.findAll<UsuarioEmpresaPapel>('usuarioEmpresaPapel')).find(
      (item) => item.USU_ID === usuario.USU_ID && item.EMP_ID === empresaId,
    );

    const papel = vinculo ? await this.findPapelOrFail(vinculo.PAP_ID) : null;

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

  private mapUsuarioRecord(usuario: UsuarioComPapel) {
    const papel = usuario.empresaPapeis[0]?.papel;

    return {
      id: usuario.id,
      nome: usuario.nome,
      telefone: usuario.telefone,
      cpf: usuario.cpf,
      cnpj: usuario.cnpj,
      usuario: usuario.usuario,
      acesso: papel?.nome || usuario.acesso,
      email: usuario.email,
      ativo: usuario.ativo,
      mfaAtivo: usuario.mfaAtivo,
      mfaMetodos: parseMfaMethods(usuario.mfaMetodos.join('|')),
      mfaMetodoPadrao: normalizeMfaMethod(usuario.mfaMetodoPadrao),
      deveTrocarSenha: usuario.deveTrocarSenha,
    };
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

  private requirePermission(user: JwtPayload, permission: string) {
    if (!user.permissoes.includes(permission)) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso');
    }
  }

  private isAdmin(user: JwtPayload) {
    return user.papelNome.toLowerCase() === 'administrador';
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

  private parsePagination(query: PaginationQuery) {
    const page = Math.max(Number(query.page) || 1, 1);
    const requestedPageSize = Math.max(Number(query.pageSize) || 10, 1);

    return {
      page,
      pageSize: Math.min(requestedPageSize, 50),
      search: query.q?.trim() || '',
    };
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
