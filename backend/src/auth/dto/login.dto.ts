import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  empresaId!: string;

  @IsString()
  @IsNotEmpty()
  identificador!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  senha!: string;
}