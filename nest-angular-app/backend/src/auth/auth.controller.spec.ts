// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('hope its defined', () => {
    expect(controller).toBeDefined();
  });
});
