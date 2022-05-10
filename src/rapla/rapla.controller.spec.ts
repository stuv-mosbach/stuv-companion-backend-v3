import { Test, TestingModule } from '@nestjs/testing';
import { RaplaController } from './rapla.controller';

describe('RaplaController', () => {
  let controller: RaplaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaplaController],
    }).compile();

    controller = module.get<RaplaController>(RaplaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
