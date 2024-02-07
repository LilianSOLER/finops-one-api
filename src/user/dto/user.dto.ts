import { IsEmail, IsNotEmpty, IsString, IsNumber} from 'class-validator';

export class UserDto{
    @IsEmail()
    @IsNotEmpty()
    email : string;

    @IsString()
    @IsNotEmpty()
    password : string;

    @IsNumber()
    id : number;
}