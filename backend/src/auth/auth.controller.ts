import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestMfaDto } from './dto/request-mfa.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { ChangePasswordRequiredDto } from './dto/change-password-required.dto';
import { JwtPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('options')
  options() {
    return this.authService.options();
  }

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip || 'unknown');
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip || 'unknown');
  }

  @Post('request-mfa')
  requestMfa(@Body() dto: RequestMfaDto, @Req() req: Request) {
    return this.authService.requestMfa(dto, req.ip || 'unknown');
  }

  @Post('verify-mfa')
  verifyMfa(@Body() dto: VerifyMfaDto, @Req() req: Request) {
    return this.authService.verifyMfa(dto, req.ip || 'unknown');
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password-required')
  changePasswordRequired(
    @Body() dto: ChangePasswordRequiredDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.authService.changePasswordRequired(
      req.user,
      dto,
      req.ip || 'unknown',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.profile(req.user.sub, req.user.empresaId, req.user.papelId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mfa/authenticator/setup')
  authenticatorSetup(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.getAuthenticatorSetup(req.user.sub);
  }
}