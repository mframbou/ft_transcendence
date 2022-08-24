// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { SessionController } from './session.controller';
import { MySessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [MySessionService],
    }).compile();

    controller = module.get<SessionController>(SessionController);
  });

  it('hope its defined', () => {
    expect(controller).toBeDefined();
  });
});
