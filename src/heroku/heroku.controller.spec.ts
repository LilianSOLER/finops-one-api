import { Test, TestingModule } from '@nestjs/testing';
import { HerokuController } from './heroku.controller';
import { HerokuService } from './heroku.service';

describe('HerokuController', () => {
  let controller: HerokuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HerokuController],
      providers: [HerokuService],
    }).compile();

    controller = module.get<HerokuController>(HerokuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
