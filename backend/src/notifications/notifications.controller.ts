import { Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Req() req: Request & { user: JwtPayload }) {
    return this.notificationsService.list(req.user.sub);
  }

  @Get('unread')
  unread(@Req() req: Request & { user: JwtPayload }) {
    return this.notificationsService.unread(req.user.sub);
  }

  @Post('test')
  test(@Req() req: Request & { user: JwtPayload }) {
    return this.notificationsService.test(req.user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: Request & { user: JwtPayload }, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }
}
