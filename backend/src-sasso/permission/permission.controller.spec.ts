// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

describe('PermissionController', () => {
  let controller: PermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [PermissionService],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
  });

  it('hope its defined', () => {
    expect(controller).toBeDefined();
  });
});
