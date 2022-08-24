// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('hope its defined', () => {
    expect(controller).toBeDefined();
  });
});
