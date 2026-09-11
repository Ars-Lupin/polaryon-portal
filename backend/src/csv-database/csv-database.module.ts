import { Global, Module } from '@nestjs/common';
import { CsvDatabaseService } from './csv-database.service';

@Global()
@Module({
  providers: [CsvDatabaseService],
  exports: [CsvDatabaseService],
})
export class CsvDatabaseModule {}
