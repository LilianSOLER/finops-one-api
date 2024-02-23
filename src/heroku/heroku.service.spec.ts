import { Test, TestingModule } from '@nestjs/testing';
import { HerokuService } from './heroku.service';

describe('HerokuService', () => {
  let service: HerokuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HerokuService],
    }).compile();

    service = module.get<HerokuService>(HerokuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
