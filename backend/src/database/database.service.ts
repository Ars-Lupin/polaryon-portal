import { Injectable } from '@nestjs/common';
import type {
  AuthLog as AuthLogModel,
  Empresa as EmpresaModel,
  Notificacao as NotificacaoModel,
  Papel as PapelModel,
  PapelPermissao as PapelPermissaoModel,
  Permissao as PermissaoModel,
  Usuario as UsuarioModel,
  UsuarioEmpresaPapel as UsuarioEmpresaPapelModel,
} from '@prisma/client';
import { PrismaService } from './prisma.service';

export type DatabaseRow = Record<string, string>;

export type TableName =
  | 'usuarios'
  | 'empresas'
  | 'papeis'
  | 'permissoes'
  | 'usuarioEmpresaPapel'
  | 'papelPermissao'
  | 'notificacoes'
  | 'authLogs';

@Injectable()
export class DatabaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll<T extends DatabaseRow = DatabaseRow>(table: TableName): Promise<T[]> {
    switch (table) {
      case 'usuarios':
        return (await this.prisma.usuario.findMany({ orderBy: { nome: 'asc' } })).map(
          this.toUsuarioRow,
        ) as T[];
      case 'empresas':
        return (await this.prisma.empresa.findMany({ orderBy: { nome: 'asc' } })).map(
          this.toEmpresaRow,
        ) as T[];
      case 'papeis':
        return (await this.prisma.papel.findMany({ orderBy: { nome: 'asc' } })).map(
          this.toPapelRow,
        ) as T[];
      case 'permissoes':
        return (await this.prisma.permissao.findMany({ orderBy: { nome: 'asc' } })).map(
          this.toPermissaoRow,
        ) as T[];
      case 'usuarioEmpresaPapel':
        return (await this.prisma.usuarioEmpresaPapel.findMany({ orderBy: { id: 'asc' } })).map(
          this.toUsuarioEmpresaPapelRow,
        ) as T[];
      case 'papelPermissao':
        return (await this.prisma.papelPermissao.findMany({ orderBy: { id: 'asc' } })).map(
          this.toPapelPermissaoRow,
        ) as T[];
      case 'notificacoes':
        return (await this.prisma.notificacao.findMany({ orderBy: { data: 'asc' } })).map(
          this.toNotificacaoRow,
        ) as T[];
      case 'authLogs':
        return (await this.prisma.authLog.findMany({ orderBy: { data: 'asc' } })).map(
          this.toAuthLogRow,
        ) as T[];
    }
  }

  async append(table: TableName, row: Record<string, unknown>) {
    switch (table) {
      case 'usuarios':
        await this.prisma.usuario.create({ data: this.usuarioCreateData(row) });
        return;
      case 'empresas':
        await this.prisma.empresa.create({ data: this.empresaData(row) });
        return;
      case 'papeis':
        await this.prisma.papel.create({ data: this.papelData(row) });
        return;
      case 'permissoes':
        await this.prisma.permissao.create({ data: this.permissaoData(row) });
        return;
      case 'usuarioEmpresaPapel':
        await this.prisma.usuarioEmpresaPapel.create({ data: this.usuarioEmpresaPapelData(row) });
        return;
      case 'papelPermissao':
        await this.prisma.papelPermissao.create({ data: this.papelPermissaoData(row) });
        return;
      case 'notificacoes':
        await this.prisma.notificacao.create({ data: this.notificacaoData(row) });
        return;
      case 'authLogs':
        await this.prisma.authLog.create({ data: this.authLogData(row) });
        return;
    }
  }

  async saveAll(table: TableName, rows: Record<string, unknown>[]) {
    await this.prisma.$transaction(async (tx) => {
      switch (table) {
        case 'usuarios':
          for (const row of rows) {
            const { id, ...data } = this.usuarioCreateData(row);
            await tx.usuario.upsert({
              where: { id },
              create: { id, ...data },
              update: data,
            });
          }
          return;
        case 'empresas':
          for (const row of rows) {
            const data = this.empresaData(row);
            await tx.empresa.upsert({
              where: { id: data.id },
              create: data,
              update: { nome: data.nome, email: data.email },
            });
          }
          return;
        case 'papeis':
          for (const row of rows) {
            const data = this.papelData(row);
            await tx.papel.upsert({
              where: { id: data.id },
              create: data,
              update: { nome: data.nome, descricao: data.descricao },
            });
          }
          return;
        case 'permissoes':
          for (const row of rows) {
            const data = this.permissaoData(row);
            await tx.permissao.upsert({
              where: { id: data.id },
              create: data,
              update: { nome: data.nome, descricao: data.descricao },
            });
          }
          return;
        case 'usuarioEmpresaPapel':
          await tx.usuarioEmpresaPapel.deleteMany();
          for (const row of rows) {
            await tx.usuarioEmpresaPapel.create({ data: this.usuarioEmpresaPapelData(row) });
          }
          return;
        case 'papelPermissao':
          await tx.papelPermissao.deleteMany();
          for (const row of rows) {
            await tx.papelPermissao.create({ data: this.papelPermissaoData(row) });
          }
          return;
        case 'notificacoes':
          for (const row of rows) {
            const data = this.notificacaoData(row);
            await tx.notificacao.upsert({
              where: { id: data.id },
              create: data,
              update: {
                usuarioId: data.usuarioId,
                titulo: data.titulo,
                mensagem: data.mensagem,
                lida: data.lida,
                data: data.data,
              },
            });
          }
          return;
        case 'authLogs':
          for (const row of rows) {
            const data = this.authLogData(row);
            await tx.authLog.upsert({
              where: { id: data.id },
              create: data,
              update: {
                data: data.data,
                evento: data.evento,
                usuarioId: data.usuarioId,
                empresaId: data.empresaId,
                identificador: data.identificador,
                ip: data.ip,
                sucesso: data.sucesso,
                mensagem: data.mensagem,
              },
            });
          }
          return;
      }
    });
  }

  private usuarioCreateData(row: Record<string, unknown>) {
    return {
      id: this.asString(row.USU_ID),
      nome: this.asString(row.USU_NOME),
      telefone: this.asString(row.USU_TELEFONE),
      cpf: this.asString(row.USU_CPF),
      cnpj: this.asString(row.USU_CNPJ),
      usuario: this.asString(row.USU_USUARIO),
      acesso: this.asString(row.USU_ACESSO),
      email: this.asString(row.USU_EMAIL),
      senhaHash: this.asString(row.USU_SENHA_HASH),
      ativo: this.asFlag(row.USU_ATIVO),
      mfaAtivo: this.asFlag(row.USU_MFA_ATIVO, true),
      mfaMetodos: this.asList(row.USU_MFA_METODOS),
      mfaMetodoPadrao: this.asString(row.USU_MFA_METODO_PADRAO) || 'EMAIL',
      totpSecret: this.asString(row.USU_TOTP_SECRET),
      deveTrocarSenha: this.asFlag(row.USU_DEVE_TROCAR_SENHA),
    };
  }

  private empresaData(row: Record<string, unknown>) {
    return {
      id: this.asString(row.EMP_ID),
      nome: this.asString(row.EMP_NOME),
      email: this.asString(row.EMP_EMAIL),
    };
  }

  private papelData(row: Record<string, unknown>) {
    return {
      id: this.asString(row.PAP_ID),
      nome: this.asString(row.PAP_NOME),
      descricao: this.asString(row.PAP_DESCRICAO),
    };
  }

  private permissaoData(row: Record<string, unknown>) {
    return {
      id: this.asString(row.PRM_ID),
      nome: this.asString(row.PRM_NOME),
      descricao: this.asString(row.PRM_DESCRICAO),
    };
  }

  private usuarioEmpresaPapelData(row: Record<string, unknown>) {
    const id = Number(row.UEP_ID || 0);

    return {
      ...(id > 0 ? { id } : {}),
      usuarioId: this.asString(row.USU_ID),
      empresaId: this.asString(row.EMP_ID),
      papelId: this.asString(row.PAP_ID),
    };
  }

  private papelPermissaoData(row: Record<string, unknown>) {
    const id = Number(row.PPE_ID || 0);

    return {
      ...(id > 0 ? { id } : {}),
      permissaoId: this.asString(row.PRM_ID),
      papelId: this.asString(row.PAP_ID),
    };
  }

  private notificacaoData(row: Record<string, unknown>) {
    return {
      id: this.asString(row.NTF_ID),
      usuarioId: this.asString(row.USU_ID),
      titulo: this.asString(row.NTF_TITULO),
      mensagem: this.asString(row.NTF_MENSAGEM),
      lida: this.asFlag(row.NTF_LIDA),
      data: this.asDate(row.NTF_DATA),
    };
  }

  private authLogData(row: Record<string, unknown>) {
    return {
      id: this.asString(row.LOG_ID),
      data: this.asDate(row.LOG_DATA),
      evento: this.asString(row.LOG_EVENTO),
      usuarioId: this.asNullableString(row.USU_ID),
      empresaId: this.asNullableString(row.EMP_ID),
      identificador: this.asString(row.IDENTIFICADOR),
      ip: this.asString(row.IP),
      sucesso: this.asFlag(row.SUCESSO),
      mensagem: this.asString(row.MENSAGEM),
    };
  }

  private toUsuarioRow(row: UsuarioModel): DatabaseRow {
    return {
      USU_ID: row.id,
      USU_NOME: row.nome,
      USU_TELEFONE: row.telefone,
      USU_CPF: row.cpf,
      USU_CNPJ: row.cnpj,
      USU_USUARIO: row.usuario,
      USU_ACESSO: row.acesso,
      USU_EMAIL: row.email,
      USU_SENHA_HASH: row.senhaHash,
      USU_ATIVO: row.ativo ? '1' : '0',
      USU_MFA_ATIVO: row.mfaAtivo ? '1' : '0',
      USU_MFA_METODOS: row.mfaMetodos.join('|'),
      USU_MFA_METODO_PADRAO: row.mfaMetodoPadrao,
      USU_TOTP_SECRET: row.totpSecret,
      USU_DEVE_TROCAR_SENHA: row.deveTrocarSenha ? '1' : '0',
    };
  }

  private toEmpresaRow(row: EmpresaModel): DatabaseRow {
    return {
      EMP_ID: row.id,
      EMP_NOME: row.nome,
      EMP_EMAIL: row.email,
    };
  }

  private toPapelRow(row: PapelModel): DatabaseRow {
    return {
      PAP_ID: row.id,
      PAP_NOME: row.nome,
      PAP_DESCRICAO: row.descricao,
    };
  }

  private toPermissaoRow(row: PermissaoModel): DatabaseRow {
    return {
      PRM_ID: row.id,
      PRM_NOME: row.nome,
      PRM_DESCRICAO: row.descricao,
    };
  }

  private toUsuarioEmpresaPapelRow(row: UsuarioEmpresaPapelModel): DatabaseRow {
    return {
      UEP_ID: String(row.id),
      USU_ID: row.usuarioId,
      EMP_ID: row.empresaId,
      PAP_ID: row.papelId,
    };
  }

  private toPapelPermissaoRow(row: PapelPermissaoModel): DatabaseRow {
    return {
      PPE_ID: String(row.id),
      PRM_ID: row.permissaoId,
      PAP_ID: row.papelId,
    };
  }

  private toNotificacaoRow(row: NotificacaoModel): DatabaseRow {
    return {
      NTF_ID: row.id,
      USU_ID: row.usuarioId,
      NTF_TITULO: row.titulo,
      NTF_MENSAGEM: row.mensagem,
      NTF_LIDA: row.lida ? '1' : '0',
      NTF_DATA: row.data.toISOString(),
    };
  }

  private toAuthLogRow(row: AuthLogModel): DatabaseRow {
    return {
      LOG_ID: row.id,
      LOG_DATA: row.data.toISOString(),
      LOG_EVENTO: row.evento,
      USU_ID: row.usuarioId || '',
      EMP_ID: row.empresaId || '',
      IDENTIFICADOR: row.identificador,
      IP: row.ip,
      SUCESSO: row.sucesso ? '1' : '0',
      MENSAGEM: row.mensagem,
    };
  }

  private asString(value: unknown) {
    return String(value ?? '');
  }

  private asNullableString(value: unknown) {
    const text = this.asString(value);
    return text ? text : null;
  }

  private asFlag(value: unknown, defaultValue = false) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    return value === true || value === '1' || String(value).toLowerCase() === 'true';
  }

  private asList(value: unknown) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }

    const text = this.asString(value);
    return text ? text.split('|').filter(Boolean) : [];
  }

  private asDate(value: unknown) {
    const date = value ? new Date(String(value)) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}
