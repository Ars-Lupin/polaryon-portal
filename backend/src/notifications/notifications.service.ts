import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';

type Notificacao = {
  NTF_ID: string;
  USU_ID: string;
  NTF_TITULO: string;
  NTF_MENSAGEM: string;
  NTF_LIDA: string;
  NTF_DATA: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly database: DatabaseService) {}

  async list(userId: string) {
    return (await this.database
      .findAll<Notificacao>('notificacoes'))
      .filter((item) => item.USU_ID === userId)
      .sort((a, b) => b.NTF_DATA.localeCompare(a.NTF_DATA))
      .map((item) => this.format(item));
  }

  async unread(userId: string) {
    return (await this.list(userId)).filter((item) => !item.lida);
  }

  async create(userId: string, titulo: string, mensagem: string) {
    const notificacao: Notificacao = {
      NTF_ID: randomUUID(),
      USU_ID: userId,
      NTF_TITULO: titulo,
      NTF_MENSAGEM: mensagem,
      NTF_LIDA: '0',
      NTF_DATA: new Date().toISOString(),
    };

    await this.database.append('notificacoes', notificacao);
    return this.format(notificacao);
  }

  test(userId: string) {
    return this.create(
      userId,
      'Notificação Polaryon',
      'Esta notificação aparece mesmo com o portal em segundo plano, desde que o navegador esteja aberto.',
    );
  }

  async markAsRead(userId: string, id: string) {
    const rows = await this.database.findAll<Notificacao>('notificacoes');
    const next = rows.map((item) => {
      if (item.NTF_ID === id && item.USU_ID === userId) {
        return { ...item, NTF_LIDA: '1' };
      }
      return item;
    });

    await this.database.saveAll('notificacoes', next);
    return { sucesso: true };
  }

  private format(item: Notificacao) {
    return {
      id: item.NTF_ID,
      titulo: item.NTF_TITULO,
      mensagem: item.NTF_MENSAGEM,
      lida: item.NTF_LIDA === '1',
      data: item.NTF_DATA,
    };
  }
}
