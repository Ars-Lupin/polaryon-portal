import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

@Injectable()
export class PasswordService {
  async hash(password: string) {
    const salt = randomBytes(16);
    const key = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt:32768:8:1:16:64:${salt.toString('base64')}:${key.toString('base64')}`;
  }

  async verify(password: string, stored: string) {
    const parts = stored.split(':');
    if (parts.length !== 8 || parts[0] !== 'scrypt') return false;

    const salt = Buffer.from(parts[6], 'base64');
    const expected = Buffer.from(parts[7], 'base64');
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
