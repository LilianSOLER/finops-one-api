import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveCredentialDto {
  @IsNotEmpty()
  @IsString()
  accessKeyId: string;
}
