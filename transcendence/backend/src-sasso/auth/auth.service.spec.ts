// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('hope its defined', () => {
    expect(service).toBeDefined();
  });
});
