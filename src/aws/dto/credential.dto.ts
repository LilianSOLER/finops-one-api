import { IsString, IsNotEmpty } from 'class-validator';

export class CredentialDto {
  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}
