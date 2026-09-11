import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CsvDatabaseService } from '../csv-database/csv-database.service';

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
  constructor(private readonly csv: CsvDatabaseService) {}

  list(userId: string) {
    return this.csv
      .findAll<Notificacao>('notificacoes')
      .filter((item) => item.USU_ID === userId)
      .sort((a, b) => b.NTF_DATA.localeCompare(a.NTF_DATA))
      .map((item) => this.format(item));
  }

  unread(userId: string) {
    return this.list(userId).filter((item) => !item.lida);
  }

  create(userId: string, titulo: string, mensagem: string) {
    const notificacao: Notificacao = {
      NTF_ID: randomUUID(),
      USU_ID: userId,
      NTF_TITULO: titulo,
      NTF_MENSAGEM: mensagem,
      NTF_LIDA: '0',
      NTF_DATA: new Date().toISOString(),
    };

    this.csv.append('notificacoes', notificacao);
    return this.format(notificacao);
  }

  test(userId: string) {
    return this.create(
      userId,
      'Notificação Polaryon',
      'Esta notificação aparece mesmo com o portal em segundo plano, desde que o navegador esteja aberto.',
    );
  }

  markAsRead(userId: string, id: string) {
    const rows = this.csv.findAll<Notificacao>('notificacoes');
    const next = rows.map((item) => {
      if (item.NTF_ID === id && item.USU_ID === userId) {
        return { ...item, NTF_LIDA: '1' };
      }
      return item;
    });

    this.csv.saveAll('notificacoes', next);
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
