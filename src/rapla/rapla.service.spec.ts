import { Test, TestingModule } from '@nestjs/testing';
import { RaplaService } from './rapla.service';

describe('RaplaService', () => {
  let service: RaplaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaplaService],
    }).compile();

    service = module.get<RaplaService>(RaplaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
