// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionService],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('hope its defined', () => {
    expect(service).toBeDefined();
  });
});
