import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginSecurityService } from './login-security.service';
import { MfaService } from './mfa.service';
import { PasswordService } from './password.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    LoginSecurityService,
    MfaService,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    PasswordService,
    LoginSecurityService,
    MfaService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
