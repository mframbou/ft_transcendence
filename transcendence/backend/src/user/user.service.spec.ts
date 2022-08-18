// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('hope its defined', () => {
    expect(service).toBeDefined();
  });
});
