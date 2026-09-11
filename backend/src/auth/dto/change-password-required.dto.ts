import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class ChangePasswordRequiredDto {
  @IsString()
  @IsNotEmpty()
  senhaAtual!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  novaSenha!: string;

  @IsString()
  @IsNotEmpty()
  confirmarNovaSenha!: string;
}