import { PartialType } from '@nestjs/swagger';
import { CreateHerokuDto } from './create-heroku.dto';

export class UpdateHerokuDto extends PartialType(CreateHerokuDto) {}
