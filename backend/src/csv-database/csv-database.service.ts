import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type CsvRow = Record<string, string>;

type TableDefinition = {
  file: string;
  headers: string[];
  seed: CsvRow[];
};

type TableName =
  | 'usuarios'
  | 'empresas'
  | 'papeis'
  | 'permissoes'
  | 'usuarioEmpresaPapel'
  | 'papelPermissao'
  | 'notificacoes'
  | 'authLogs'
  | 'mfaDesafios';

@Injectable()
export class CsvDatabaseService implements OnModuleInit {
  private readonly dataDir = join(process.cwd(), 'data');

  private readonly adminPasswordHash =
    'scrypt:32768:8:1:16:64:7fXpEwjRihoGyfUn+GJI9A==:av6meB2VQVI9eThdSBCc9KdxI6PAYDzINHQc50YiD9w6MZvlICgmeeCEArH3fwlHMFFX4kEr7V/C4BCRUEBHOA==';

  private readonly tables: Record<TableName, TableDefinition> = {
    usuarios: {
      file: 'ACESSO_USUARIO.csv',
      headers: [
        'USU_ID',
        'USU_NOME',
        'USU_TELEFONE',
        'USU_CPF',
        'USU_CNPJ',
        'USU_USUARIO',
        'USU_ACESSO',
        'USU_EMAIL',
        'USU_SENHA_HASH',
        'USU_ATIVO',
        'USU_MFA_ATIVO',
        'USU_MFA_METODOS',
        'USU_MFA_METODO_PADRAO',
        'USU_TOTP_SECRET',
        'USU_DEVE_TROCAR_SENHA',
      ],
      seed: [
        {
          USU_ID: 'admin-macroex',
          USU_NOME: 'Admin Macroex',
          USU_TELEFONE: '27999990000',
          USU_CPF: '11122233344',
          USU_CNPJ: '01234567000100',
          USU_USUARIO: 'admin_macroex',
          USU_ACESSO: 'ADMINISTRADOR',
          USU_EMAIL: 'admin.macroex@polaryon.local',
          USU_SENHA_HASH: this.adminPasswordHash,
          USU_ATIVO: '1',
          USU_MFA_ATIVO: '1',
          USU_MFA_METODOS: 'EMAIL|SMS|WHATSAPP|AUTHENTICATOR',
          USU_MFA_METODO_PADRAO: 'EMAIL',
          USU_TOTP_SECRET: 'JBSWY3DPEHPK3PXP',
          USU_DEVE_TROCAR_SENHA: '1',
        },
      ],
    },
    empresas: {
      file: 'ACESSO_EMPRESA.csv',
      headers: ['EMP_ID', 'EMP_NOME', 'EMP_EMAIL'],
      seed: [
        {
          EMP_ID: 'c5041ec9-0df5-4d53-b883-b95f995a2057',
          EMP_NOME: 'Macroex',
          EMP_EMAIL: 'contato.macroex@hotmail.com',
        },
        {
          EMP_ID: '44b70bbb-7985-4858-a118-ae15cd911b7c',
          EMP_NOME: 'Actus',
          EMP_EMAIL: 'contato@actus.local',
        },
        {
          EMP_ID: '802c13f0-ff0e-4aa2-8604-8674bd784695',
          EMP_NOME: 'Kamell',
          EMP_EMAIL: 'contato@kamell.local',
        },
        {
          EMP_ID: '4a81856c-1120-4b7b-998e-0f2fa2647829',
          EMP_NOME: 'Atmos',
          EMP_EMAIL: 'contato@atmos.local',
        },
        {
          EMP_ID: '57683297-24d3-4ef4-9916-ac7daecfd13e',
          EMP_NOME: 'Tohatsu',
          EMP_EMAIL: 'contato@tohatsu.local',
        },
      ],
    },
    papeis: {
      file: 'ACESSO_PAPEL.csv',
      headers: ['PAP_ID', 'PAP_NOME', 'PAP_DESCRICAO'],
      seed: [
        {
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
          PAP_NOME: 'Administrador',
          PAP_DESCRICAO: 'Acesso total ao portal',
        },
        {
          PAP_ID: 'e8980e81-3f09-4c8d-a161-40a3164ec706',
          PAP_NOME: 'Revenda',
          PAP_DESCRICAO: 'Parceiro com acesso aos recursos da empresa',
        },
        {
          PAP_ID: 'b747bc43-c7da-40c5-84f3-7d8a7557fce5',
          PAP_NOME: 'Consulta',
          PAP_DESCRICAO: 'Acesso somente leitura',
        },
      ],
    },
    permissoes: {
      file: 'ACESSO_PERMISSAO.csv',
      headers: ['PRM_ID', 'PRM_NOME', 'PRM_DESCRICAO'],
      seed: [
        {
          PRM_ID: '3d681b61-2e97-43d7-a4e0-9644a1b3ebce',
          PRM_NOME: 'usuarios.ler',
          PRM_DESCRICAO: 'Listar usuários da própria empresa',
        },
        {
          PRM_ID: '220b1ca5-17e1-42a2-b389-22d99137a31c',
          PRM_NOME: 'usuarios.criar',
          PRM_DESCRICAO: 'Cadastrar usuários na própria empresa',
        },
        {
          PRM_ID: 'a4582042-e8b1-4ebd-9751-6cae2ba4a13e',
          PRM_NOME: 'empresas.ler',
          PRM_DESCRICAO: 'Listar empresas',
        },
        {
          PRM_ID: '7b11a9ae-7b59-49cf-a3d4-2c75fc39591f',
          PRM_NOME: 'empresas.criar',
          PRM_DESCRICAO: 'Cadastrar empresas',
        },
        {
          PRM_ID: '344f2333-b4db-4042-ae72-f32f0799d347',
          PRM_NOME: 'papeis.ler',
          PRM_DESCRICAO: 'Listar papéis',
        },
        {
          PRM_ID: 'a023a95d-8873-4106-bba1-106a4aa2633b',
          PRM_NOME: 'papeis.criar',
          PRM_DESCRICAO: 'Cadastrar papéis',
        },
        {
          PRM_ID: '746071ad-4a1f-43f4-858a-285753b0dd43',
          PRM_NOME: 'permissoes.ler',
          PRM_DESCRICAO: 'Listar permissões',
        },
      ],
    },
    usuarioEmpresaPapel: {
      file: 'ACESSO_USU_EMP_PAP.csv',
      headers: ['UEP_ID', 'USU_ID', 'EMP_ID', 'PAP_ID'],
      seed: [
        {
          UEP_ID: '1',
          USU_ID: 'admin-macroex',
          EMP_ID: 'c5041ec9-0df5-4d53-b883-b95f995a2057',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
      ],
    },
    papelPermissao: {
      file: 'ACESSO_PAP_PRM.csv',
      headers: ['PPE_ID', 'PRM_ID', 'PAP_ID'],
      seed: [
        {
          PPE_ID: '1',
          PRM_ID: '3d681b61-2e97-43d7-a4e0-9644a1b3ebce',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
        {
          PPE_ID: '2',
          PRM_ID: '220b1ca5-17e1-42a2-b389-22d99137a31c',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
        {
          PPE_ID: '3',
          PRM_ID: 'a4582042-e8b1-4ebd-9751-6cae2ba4a13e',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
        {
          PPE_ID: '4',
          PRM_ID: '7b11a9ae-7b59-49cf-a3d4-2c75fc39591f',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
        {
          PPE_ID: '5',
          PRM_ID: '344f2333-b4db-4042-ae72-f32f0799d347',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
        {
          PPE_ID: '6',
          PRM_ID: 'a023a95d-8873-4106-bba1-106a4aa2633b',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
        {
          PPE_ID: '7',
          PRM_ID: '746071ad-4a1f-43f4-858a-285753b0dd43',
          PAP_ID: '13493203-0ac9-4e8c-8516-2255f709bb50',
        },
      ],
    },
    notificacoes: {
      file: 'NOTIFICACAO.csv',
      headers: ['NTF_ID', 'USU_ID', 'NTF_TITULO', 'NTF_MENSAGEM', 'NTF_LIDA', 'NTF_DATA'],
      seed: [],
    },
    authLogs: {
      file: 'ACESSO_AUTH_LOG.csv',
      headers: [
        'LOG_ID',
        'LOG_DATA',
        'LOG_EVENTO',
        'USU_ID',
        'EMP_ID',
        'IDENTIFICADOR',
        'IP',
        'SUCESSO',
        'MENSAGEM',
      ],
      seed: [],
    },
    mfaDesafios: {
      file: 'ACESSO_MFA_DESAFIO.csv',
      headers: [
        'MFA_ID',
        'USU_ID',
        'EMP_ID',
        'MFA_METODO',
        'MFA_DESTINO',
        'MFA_STATUS',
        'MFA_DATA_CRIACAO',
        'MFA_DATA_EXPIRACAO',
        'MFA_TENTATIVAS',
      ],
      seed: [],
    },
  };

  onModuleInit() {
    mkdirSync(this.dataDir, { recursive: true });

    for (const definition of Object.values(this.tables)) {
      const path = join(this.dataDir, definition.file);

      if (!existsSync(path)) {
        this.writeFile(path, definition.headers, definition.seed);
      }
    }
  }

  findAll<T extends CsvRow = CsvRow>(table: TableName): T[] {
    const definition = this.tables[table];
    const path = join(this.dataDir, definition.file);
    const content = readFileSync(path, 'utf-8');

    return this.parse(content) as T[];
  }

  saveAll(table: TableName, rows: object[]) {
    const definition = this.tables[table];
    const path = join(this.dataDir, definition.file);

    this.writeFile(path, definition.headers, rows);
  }

  append(table: TableName, row: object) {
    const rows = this.findAll(table) as object[];
    rows.push(row);
    this.saveAll(table, rows);
  }

  nextNumericId(table: TableName, column: string) {
    const rows = this.findAll(table);
    const max = rows.reduce((acc, row) => Math.max(acc, Number(row[column] || 0)), 0);

    return String(max + 1);
  }

  private writeFile(path: string, headers: string[], rows: object[]) {
    const content = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => this.escape((row as Record<string, unknown>)[header] || ''))
          .join(','),
      ),
    ].join('\n');

    writeFileSync(path, content + '\n', 'utf-8');
  }

  private escape(value: unknown) {
    const normalized = String(value ?? '');

    if (/[",\n\r]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }

    return normalized;
  }

  private parse(content: string): CsvRow[] {
    const trimmed = content.trim();

    if (!trimmed) {
      return [];
    }

    const lines = this.splitLines(trimmed);

    if (lines.length === 0) {
      return [];
    }

    const headers = this.parseLine(lines[0]);

    return lines
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const values = this.parseLine(line);

        return headers.reduce<CsvRow>((acc, header, index) => {
          acc[header] = values[index] || '';
          return acc;
        }, {});
      });
  }

  private splitLines(content: string) {
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
        continue;
      }

      if (char === '\n' && !inQuotes) {
        lines.push(current.replace(/\r$/, ''));
        current = '';
        continue;
      }

      current += char;
    }

    if (current) {
      lines.push(current.replace(/\r$/, ''));
    }

    return lines;
  }

  private parseLine(line: string) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    values.push(current);

    return values;
  }
}