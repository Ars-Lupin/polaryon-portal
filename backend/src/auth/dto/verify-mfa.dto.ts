import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'O código MFA deve conter 6 números',
  })
  codigo!: string;
}