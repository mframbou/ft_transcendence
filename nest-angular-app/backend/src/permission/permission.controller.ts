// Nest
import { Controller } from '@nestjs/common';

// Transcendence
import { PermissionService } from './permission.service';

@Controller('permission')
export class PermissionController {
	constructor(private readonly permissionService: PermissionService) {}

}
