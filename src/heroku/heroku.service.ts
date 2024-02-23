import { Injectable } from '@nestjs/common';
import { CreateHerokuDto } from './dto/create-heroku.dto';
import { UpdateHerokuDto } from './dto/update-heroku.dto';

@Injectable()
export class HerokuService {
  create(createHerokuDto: CreateHerokuDto) {
    return 'This action adds a new heroku';
  }

  findAll() {
    return `This action returns all heroku`;
  }

  findOne(id: number) {
    return `This action returns a #${id} heroku`;
  }

  update(id: number, updateHerokuDto: UpdateHerokuDto) {
    return `This action updates a #${id} heroku`;
  }

  remove(id: number) {
    return `This action removes a #${id} heroku`;
  }
}
