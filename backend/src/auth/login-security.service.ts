import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { MfaMethod } from './auth.types';

type LoginAttempt = {
  count: number;
  blockedUntil?: number;
  lastAttemptAt: number;
};

type MfaSession = {
  mfaSessionId: string;
  userId: string;
  empresaId: string;
  papelId: string;
  methods: MfaMethod[];
  expiresAt: number;
  expiresInSeconds: number;
};

type CreateMfaSessionInput = {
  userId: string;
  empresaId: string;
  papelId: string;
  methods: MfaMethod[];
};

type MfaChallenge = {
  challengeId: string;
  mfaSessionId: string;
  userId: string;
  empresaId: string;
  papelId: string;
  method: MfaMethod;
  codeHash?: string;
  expiresAt: number;
  expiresInSeconds: number;
  attempts: number;
};

type CreateMfaChallengeInput = {
  mfaSessionId: string;
  userId: string;
  empresaId: string;
  papelId: string;
  method: MfaMethod;
  code?: string;
};

type VerifyMfaOptions = {
  authenticatorValid?: boolean;
};

@Injectable()
export class LoginSecurityService {
  private readonly accountAttempts = new Map<string, LoginAttempt>();
  private readonly ipAttempts = new Map<string, LoginAttempt>();
  private readonly mfaSessions = new Map<string, MfaSession>();
  private readonly mfaChallenges = new Map<string, MfaChallenge>();

  private readonly maxAccountAttempts = 5;
  private readonly maxIpAttempts = 25;
  private readonly blockMs = 15 * 60 * 1000;

  private readonly mfaSessionTtlMs = 10 * 60 * 1000;
  private readonly mfaChallengeTtlMs = 5 * 60 * 1000;
  private readonly maxMfaAttempts = 5;

  buildAccountKey(empresaId: string, identificador: string) {
    return `${String(empresaId || '').trim()}::${String(identificador || '').trim()}`;
  }

  isBlocked(accountKey: string, ip: string) {
    this.clearExpiredLoginBlocks();

    const accountAttempt = this.accountAttempts.get(accountKey);
    const ipAttempt = this.ipAttempts.get(ip || 'unknown');
    const now = Date.now();

    if (accountAttempt?.blockedUntil && accountAttempt.blockedUntil > now) {
      return true;
    }

    if (ipAttempt?.blockedUntil && ipAttempt.blockedUntil > now) {
      return true;
    }

    return false;
  }

  recordFailure(accountKey: string, ip: string) {
    const ipKey = ip || 'unknown';

    this.recordAttempt(this.accountAttempts, accountKey, this.maxAccountAttempts);
    this.recordAttempt(this.ipAttempts, ipKey, this.maxIpAttempts);
  }

  recordSuccess(accountKey: string, ip: string) {
    this.accountAttempts.delete(accountKey);
    this.ipAttempts.delete(ip || 'unknown');
  }

  createMfaSession(input: CreateMfaSessionInput) {
    this.clearExpiredMfaData();

    if (!input.userId || !input.empresaId || !input.papelId) {
      throw new BadRequestException('Dados inválidos para sessão MFA');
    }

    if (!input.methods || input.methods.length === 0) {
      throw new BadRequestException('Nenhum método MFA disponível');
    }

    const expiresAt = Date.now() + this.mfaSessionTtlMs;

    const session: MfaSession = {
      mfaSessionId: randomUUID(),
      userId: input.userId,
      empresaId: input.empresaId,
      papelId: input.papelId,
      methods: input.methods,
      expiresAt,
      expiresInSeconds: Math.floor(this.mfaSessionTtlMs / 1000),
    };

    this.mfaSessions.set(session.mfaSessionId, session);

    return session;
  }

  getMfaSessionOrThrow(mfaSessionId: string) {
    this.clearExpiredMfaData();

    const session = this.mfaSessions.get(mfaSessionId);

    if (!session) {
      throw new UnauthorizedException('Sessão MFA expirada ou inválida');
    }

    if (session.expiresAt <= Date.now()) {
      this.mfaSessions.delete(mfaSessionId);
      throw new UnauthorizedException('Sessão MFA expirada ou inválida');
    }

    return session;
  }

  createMfaChallenge(input: CreateMfaChallengeInput) {
    this.clearExpiredMfaData();

    const session = this.getMfaSessionOrThrow(input.mfaSessionId);

    if (session.userId !== input.userId) {
      throw new UnauthorizedException('Sessão MFA inválida');
    }

    if (session.empresaId !== input.empresaId) {
      throw new UnauthorizedException('Sessão MFA inválida');
    }

    if (session.papelId !== input.papelId) {
      throw new UnauthorizedException('Sessão MFA inválida');
    }

    if (!session.methods.includes(input.method)) {
      throw new BadRequestException('Método MFA não disponível para este usuário');
    }

    const expiresAt = Date.now() + this.mfaChallengeTtlMs;

    const challenge: MfaChallenge = {
      challengeId: randomUUID(),
      mfaSessionId: input.mfaSessionId,
      userId: input.userId,
      empresaId: input.empresaId,
      papelId: input.papelId,
      method: input.method,
      expiresAt,
      expiresInSeconds: Math.floor(this.mfaChallengeTtlMs / 1000),
      attempts: 0,
    };

    if (input.method === 'EMAIL') {
      if (!input.code) {
        throw new BadRequestException('Código MFA não informado');
      }

      challenge.codeHash = this.hashCode(input.code);
    }

    this.mfaChallenges.set(challenge.challengeId, challenge);

    return challenge;
  }

  readMfaChallengeOrThrow(challengeId: string) {
    this.clearExpiredMfaData();

    const challenge = this.mfaChallenges.get(challengeId);

    if (!challenge) {
      throw new UnauthorizedException('Código MFA expirado ou inválido');
    }

    if (challenge.expiresAt <= Date.now()) {
      this.mfaChallenges.delete(challengeId);
      throw new UnauthorizedException('Código MFA expirado ou inválido');
    }

    if (challenge.attempts >= this.maxMfaAttempts) {
      this.mfaChallenges.delete(challengeId);
      throw new UnauthorizedException('Tentativas MFA excedidas');
    }

    return challenge;
  }

  verifyMfaChallenge(
    challengeId: string,
    code: string,
    options: VerifyMfaOptions = {},
  ) {
    const challenge = this.readMfaChallengeOrThrow(challengeId);

    challenge.attempts += 1;

    const cleanCode = String(code || '').trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      if (challenge.attempts >= this.maxMfaAttempts) {
        this.mfaChallenges.delete(challengeId);
      }

      throw new UnauthorizedException('Código MFA inválido');
    }

    let valid = false;

    if (challenge.method === 'AUTHENTICATOR') {
      valid = options.authenticatorValid === true;
    }

    if (challenge.method === 'EMAIL') {
      if (!challenge.codeHash) {
        throw new UnauthorizedException('Código MFA inválido');
      }

      valid = this.safeCompare(challenge.codeHash, this.hashCode(cleanCode));
    }

    if (!valid) {
      if (challenge.attempts >= this.maxMfaAttempts) {
        this.mfaChallenges.delete(challengeId);
      }

      throw new UnauthorizedException('Código MFA inválido');
    }

    this.mfaChallenges.delete(challengeId);
    this.mfaSessions.delete(challenge.mfaSessionId);

    return {
      userId: challenge.userId,
      empresaId: challenge.empresaId,
      papelId: challenge.papelId,
      method: challenge.method,
    };
  }

  private recordAttempt(
    map: Map<string, LoginAttempt>,
    key: string,
    maxAttempts: number,
  ) {
    const now = Date.now();
    const current = map.get(key);

    if (current?.blockedUntil && current.blockedUntil > now) {
      return;
    }

    const nextCount = current ? current.count + 1 : 1;

    map.set(key, {
      count: nextCount,
      lastAttemptAt: now,
      blockedUntil: nextCount >= maxAttempts ? now + this.blockMs : undefined,
    });
  }

  private clearExpiredLoginBlocks() {
    const now = Date.now();

    for (const [key, attempt] of this.accountAttempts.entries()) {
      const expiredBlock = attempt.blockedUntil && attempt.blockedUntil <= now;
      const oldAttempt = now - attempt.lastAttemptAt > this.blockMs;

      if (expiredBlock || oldAttempt) {
        this.accountAttempts.delete(key);
      }
    }

    for (const [key, attempt] of this.ipAttempts.entries()) {
      const expiredBlock = attempt.blockedUntil && attempt.blockedUntil <= now;
      const oldAttempt = now - attempt.lastAttemptAt > this.blockMs;

      if (expiredBlock || oldAttempt) {
        this.ipAttempts.delete(key);
      }
    }
  }

  private clearExpiredMfaData() {
    const now = Date.now();

    for (const [key, session] of this.mfaSessions.entries()) {
      if (session.expiresAt <= now) {
        this.mfaSessions.delete(key);
      }
    }

    for (const [key, challenge] of this.mfaChallenges.entries()) {
      if (challenge.expiresAt <= now) {
        this.mfaChallenges.delete(key);
      }
    }
  }

  private hashCode(code: string) {
    const secret = this.getHashSecret();

    return createHmac('sha256', secret)
      .update(String(code || '').trim())
      .digest('hex');
  }

  private getHashSecret() {
    const secret =
      process.env.MFA_CODE_SECRET ||
      process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      '';

    if (!secret) {
      throw new Error(
        'MFA_CODE_SECRET ou JWT_SECRET não configurado no backend/.env',
      );
    }

    return secret;
  }

  private safeCompare(valueA: string, valueB: string) {
    const bufferA = Buffer.from(valueA);
    const bufferB = Buffer.from(valueB);

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return timingSafeEqual(bufferA, bufferB);
  }
}