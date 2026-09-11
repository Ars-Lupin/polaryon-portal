import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]{3,30}$/, {
    message:
      'O usuário deve ter de 3 a 30 caracteres e usar apenas letras, números, ponto, hífen ou underline',
  })
  usuario!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  senha!: string;

  @IsString()
  @IsNotEmpty()
  empresaId!: string;
}