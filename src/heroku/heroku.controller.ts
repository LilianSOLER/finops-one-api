import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HerokuService } from './heroku.service';
import { CreateHerokuDto } from './dto/create-heroku.dto';
import { UpdateHerokuDto } from './dto/update-heroku.dto';

@Controller('heroku')
export class HerokuController {
  constructor(private readonly herokuService: HerokuService) {}

  @Post()
  create(@Body() createHerokuDto: CreateHerokuDto) {
    return this.herokuService.create(createHerokuDto);
  }

  @Get()
  findAll() {
    return this.herokuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.herokuService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHerokuDto: UpdateHerokuDto) {
    return this.herokuService.update(+id, updateHerokuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.herokuService.remove(+id);
  }
}
