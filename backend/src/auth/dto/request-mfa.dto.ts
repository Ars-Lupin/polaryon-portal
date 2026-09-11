import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { MfaMethod } from '../auth.types';

export class RequestMfaDto {
  @IsString()
  @IsNotEmpty()
  mfaSessionId!: string;

  @IsString()
  @IsIn(['EMAIL', 'AUTHENTICATOR'])
  metodo!: MfaMethod;
}