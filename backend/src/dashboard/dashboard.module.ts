import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CsvDatabaseModule } from '../csv-database/csv-database.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [CsvDatabaseModule, AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}