import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminPasswordHash =
  'scrypt:32768:8:1:16:64:7fXpEwjRihoGyfUn+GJI9A==:av6meB2VQVI9eThdSBCc9KdxI6PAYDzINHQc50YiD9w6MZvlICgmeeCEArH3fwlHMFFX4kEr7V/C4BCRUEBHOA==';

const empresas = [
  {
    id: 'c5041ec9-0df5-4d53-b883-b95f995a2057',
    nome: 'Macroex',
    email: 'contato.macroex@hotmail.com',
  },
  {
    id: '44b70bbb-7985-4858-a118-ae15cd911b7c',
    nome: 'Actus',
    email: 'contato@actus.local',
  },
  {
    id: '802c13f0-ff0e-4aa2-8604-8674bd784695',
    nome: 'Kamell',
    email: 'contato@kamell.local',
  },
  {
    id: '4a81856c-1120-4b7b-998e-0f2fa2647829',
    nome: 'Atmos',
    email: 'contato@atmos.local',
  },
  {
    id: '57683297-24d3-4ef4-9916-ac7daecfd13e',
    nome: 'Tohatsu',
    email: 'contato@tohatsu.local',
  },
];

const papeis = [
  {
    id: '13493203-0ac9-4e8c-8516-2255f709bb50',
    nome: 'Administrador',
    descricao: 'Acesso total ao portal',
  },
  {
    id: 'e8980e81-3f09-4c8d-a161-40a3164ec706',
    nome: 'Revenda',
    descricao: 'Parceiro com acesso aos recursos da empresa',
  },
  {
    id: 'b747bc43-c7da-40c5-84f3-7d8a7557fce5',
    nome: 'Consulta',
    descricao: 'Acesso somente leitura',
  },
];

const permissoes = [
  {
    id: '3d681b61-2e97-43d7-a4e0-9644a1b3ebce',
    nome: 'usuarios.ler',
    descricao: 'Listar usuários da própria empresa',
  },
  {
    id: '220b1ca5-17e1-42a2-b389-22d99137a31c',
    nome: 'usuarios.criar',
    descricao: 'Cadastrar usuários na própria empresa',
  },
  {
    id: 'a4582042-e8b1-4ebd-9751-6cae2ba4a13e',
    nome: 'empresas.ler',
    descricao: 'Listar empresas',
  },
  {
    id: '7b11a9ae-7b59-49cf-a3d4-2c75fc39591f',
    nome: 'empresas.criar',
    descricao: 'Cadastrar empresas',
  },
  {
    id: '344f2333-b4db-4042-ae72-f32f0799d347',
    nome: 'papeis.ler',
    descricao: 'Listar papéis',
  },
  {
    id: 'a023a95d-8873-4106-bba1-106a4aa2633b',
    nome: 'papeis.criar',
    descricao: 'Cadastrar papéis',
  },
  {
    id: '746071ad-4a1f-43f4-858a-285753b0dd43',
    nome: 'permissoes.ler',
    descricao: 'Listar permissões',
  },
];

async function main() {
  for (const empresa of empresas) {
    await prisma.empresa.upsert({
      where: { id: empresa.id },
      create: empresa,
      update: empresa,
    });
  }

  for (const papel of papeis) {
    await prisma.papel.upsert({
      where: { id: papel.id },
      create: papel,
      update: papel,
    });
  }

  for (const permissao of permissoes) {
    await prisma.permissao.upsert({
      where: { id: permissao.id },
      create: permissao,
      update: permissao,
    });
  }

  const administradorId = '13493203-0ac9-4e8c-8516-2255f709bb50';

  for (const permissao of permissoes) {
    await prisma.papelPermissao.upsert({
      where: {
        permissaoId_papelId: {
          permissaoId: permissao.id,
          papelId: administradorId,
        },
      },
      create: {
        permissaoId: permissao.id,
        papelId: administradorId,
      },
      update: {},
    });
  }

  await prisma.usuario.upsert({
    where: { id: 'admin-macroex' },
    create: {
      id: 'admin-macroex',
      nome: 'Admin Macroex',
      telefone: '27999990000',
      cpf: '11122233344',
      cnpj: '01234567000100',
      usuario: 'admin_macroex',
      acesso: 'ADMINISTRADOR',
      email: 'admin.macroex@polaryon.local',
      senhaHash: adminPasswordHash,
      ativo: true,
      mfaAtivo: true,
      mfaMetodos: ['EMAIL', 'SMS', 'WHATSAPP', 'AUTHENTICATOR'],
      mfaMetodoPadrao: 'EMAIL',
      totpSecret: 'JBSWY3DPEHPK3PXP',
      deveTrocarSenha: true,
    },
    update: {
      nome: 'Admin Macroex',
      telefone: '27999990000',
      cpf: '11122233344',
      cnpj: '01234567000100',
      usuario: 'admin_macroex',
      acesso: 'ADMINISTRADOR',
      email: 'admin.macroex@polaryon.local',
      senhaHash: adminPasswordHash,
      ativo: true,
      mfaAtivo: true,
      mfaMetodos: ['EMAIL', 'SMS', 'WHATSAPP', 'AUTHENTICATOR'],
      mfaMetodoPadrao: 'EMAIL',
      totpSecret: 'JBSWY3DPEHPK3PXP',
      deveTrocarSenha: true,
    },
  });

  await prisma.usuarioEmpresaPapel.upsert({
    where: {
      usuarioId_empresaId: {
        usuarioId: 'admin-macroex',
        empresaId: 'c5041ec9-0df5-4d53-b883-b95f995a2057',
      },
    },
    create: {
      usuarioId: 'admin-macroex',
      empresaId: 'c5041ec9-0df5-4d53-b883-b95f995a2057',
      papelId: administradorId,
    },
    update: {
      papelId: administradorId,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
