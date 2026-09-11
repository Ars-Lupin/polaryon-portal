import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { MfaMethod, Usuario } from './auth.types';
import {
  maskIdentifier,
  normalizeMfaMethod,
  parseMfaMethods,
} from './security.utils';
import { transporterModule } from './mfa-email-transporter';

type SendCodeParams = {
  method: MfaMethod;
  usuario: Usuario;
  code: string;
  empresaId: string;
  expiresInSeconds: number;
};

@Injectable()
export class MfaService {
  private readonly issuer = process.env.AUTHENTICATOR_ISSUER || 'Polaryon';

  generateCode() {
    return String(randomInt(100000, 1000000));
  }

  generateTotpSecret() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = randomBytes(20);

    let output = '';

    for (const byte of bytes) {
      output += alphabet[byte % alphabet.length];
    }

    return output;
  }

  getAvailableMethods(usuario: Usuario): MfaMethod[] {
    if (usuario.USU_MFA_ATIVO === '0') {
      return [];
    }

    return parseMfaMethods(usuario.USU_MFA_METODOS);
  }

  getDefaultMethod(usuario: Usuario): MfaMethod {
    const methods = this.getAvailableMethods(usuario);
    const preferred = normalizeMfaMethod(usuario.USU_MFA_METODO_PADRAO);

    if (methods.includes(preferred)) {
      return preferred;
    }

    return methods[0] || 'EMAIL';
  }

  getMethodLabel(method: MfaMethod) {
    const labels: Record<MfaMethod, string> = {
      EMAIL: 'E-mail',
      AUTHENTICATOR: 'Aplicativo autenticador',
    };

    return labels[method];
  }

  getDestination(method: MfaMethod, usuario: Usuario) {
    if (method === 'EMAIL') {
      return maskIdentifier(usuario.USU_EMAIL || '');
    }

    return 'Aplicativo autenticador';
  }

  async sendCode(params: SendCodeParams) {
    const { method, usuario, code, empresaId, expiresInSeconds } = params;

    if (method === 'AUTHENTICATOR') {
      return {
        destino: this.getDestination(method, usuario),
        mensagem: 'Informe o código do seu aplicativo autenticador',
      };
    }

    if (method === 'EMAIL') {
      await this.sendEmailCode(usuario, code, expiresInSeconds, empresaId);

      return {
        destino: this.getDestination(method, usuario),
        mensagem: 'Código enviado por e-mail',
      };
    }

    throw new BadRequestException('Método MFA inválido');
  }

  getAuthenticatorUri(usuario: Usuario) {
    const secret = usuario.USU_TOTP_SECRET || '';
    const accountName = encodeURIComponent(
      usuario.USU_EMAIL || usuario.USU_USUARIO || usuario.USU_ID,
    );
    const issuer = encodeURIComponent(this.issuer);

    return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  }

  getAuthenticatorSetup(usuario: Usuario) {
    return {
      issuer: this.issuer,
      accountName: usuario.USU_EMAIL || usuario.USU_USUARIO || usuario.USU_ID,
      secret: usuario.USU_TOTP_SECRET || '',
      otpauthUrl: this.getAuthenticatorUri(usuario),
    };
  }

  verifyTotp(secret: string, code: string) {
    const cleanCode = String(code || '').trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return false;
    }

    const currentCounter = Math.floor(Date.now() / 1000 / 30);

    const validCodes = [
      this.totp(secret, currentCounter - 1),
      this.totp(secret, currentCounter),
      this.totp(secret, currentCounter + 1),
    ];

    return validCodes.includes(cleanCode);
  }

  private async sendEmailCode(
    usuario: Usuario,
    code: string,
    expiresInSeconds: number,
    empresaId: string,
  ) {
    const email = String(usuario.USU_EMAIL || '').trim();

    if (!email) {
      throw new BadRequestException('Usuário sem e-mail para MFA');
    }

    const provedor = process.env.SMTP_PROVEDOR || 'GMAIL';
    const originEmail = process.env.SMTP_USER || '';
    const appPWD = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS || '';
    const fromName = process.env.SMTP_FROM_NAME || 'Polaryon';

    if (!originEmail || !appPWD) {
      throw new ServiceUnavailableException('SMTP não configurado');
    }

    const transporter = transporterModule(provedor, originEmail, appPWD);

    await transporter.sendMail({
      from: `"${fromName}" <${originEmail}>`,
      to: email,
      subject: 'Seu código de verificação - Polaryon',
      html: `
        <div style="margin:0;padding:0;background:#06101d;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:32px;">
            <div style="background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e5e7eb;">
              <div style="margin-bottom:24px;">
                <div style="font-size:26px;font-weight:800;color:#0b1530;letter-spacing:-0.04em;">
                  Polaryon
                </div>
                <div style="font-size:13px;color:#64748b;margin-top:4px;">
                  Portal de parceiros
                </div>
              </div>

              <h1 style="font-size:22px;margin:0 0 12px;color:#0f172a;">
                Código de verificação
              </h1>

              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 16px;">
                Olá, <strong>${usuario.USU_NOME}</strong>.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 20px;">
                Use o código abaixo para concluir seu acesso ao Polaryon.
              </p>

              <div style="margin:28px 0;padding:22px;border-radius:18px;background:#eef2ff;text-align:center;font-size:34px;letter-spacing:10px;font-weight:800;color:#312e81;">
                ${code}
              </div>

              <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 8px;">
                Este código expira em <strong>${Math.floor(expiresInSeconds / 60)} minutos</strong>.
              </p>

              <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:0;">
                Se você não solicitou este acesso, ignore este e-mail. Nunca compartilhe este código.
              </p>

              <div style="margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:12px;color:#94a3b8;">
                Empresa vinculada: ${empresaId}
              </div>
            </div>
          </div>
        </div>
      `,
      text: `Seu código Polaryon é ${code}. Ele expira em ${Math.floor(
        expiresInSeconds / 60,
      )} minutos. Não compartilhe este código.`,
    });
  }

  private totp(secret: string, counter: number) {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);

    let tempCounter = counter;

    for (let i = 7; i >= 0; i--) {
      buffer[i] = tempCounter & 0xff;
      tempCounter = Math.floor(tempCounter / 256);
    }

    const hmac = createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;

    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    return String(binary % 1000000).padStart(6, '0');
  }

  private base32Decode(value: string) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const clean = String(value || '')
      .replace(/=+$/g, '')
      .replace(/\s/g, '')
      .toUpperCase();

    let bits = '';

    for (const char of clean) {
      const index = alphabet.indexOf(char);

      if (index === -1) {
        continue;
      }

      bits += index.toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];

    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return Buffer.from(bytes);
  }
}