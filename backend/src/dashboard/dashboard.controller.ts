import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { DashboardService, PaginationQuery } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/summary')
  summary(@Req() req: RequestWithUser) {
    return this.dashboardService.summary(req.user);
  }

  @Get('usuarios')
  usuarios(@Req() req: RequestWithUser, @Query() query: PaginationQuery) {
    return this.dashboardService.usuarios(req.user, query);
  }

  @Post('usuarios')
  criarUsuario(@Req() req: RequestWithUser, @Body() body: Record<string, string>) {
    return this.dashboardService.criarUsuario(req.user, body);
  }

  @Get('empresas')
  empresas(@Req() req: RequestWithUser, @Query() query: PaginationQuery) {
    return this.dashboardService.empresas(req.user, query);
  }

  @Post('empresas')
  criarEmpresa(@Req() req: RequestWithUser, @Body() body: Record<string, string>) {
    return this.dashboardService.criarEmpresa(req.user, body);
  }

  @Get('papeis')
  papeis(@Req() req: RequestWithUser) {
    return this.dashboardService.papeis(req.user);
  }

  @Post('papeis')
  criarPapel(@Req() req: RequestWithUser, @Body() body: Record<string, string>) {
    return this.dashboardService.criarPapel(req.user, body);
  }

  @Get('permissoes')
  permissoes(@Req() req: RequestWithUser) {
    return this.dashboardService.permissoes(req.user);
  }
}
