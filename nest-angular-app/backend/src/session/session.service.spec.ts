// Nest
import { Test, TestingModule } from '@nestjs/testing';

// Transcendence
import { MySessionService } from './session.service';

describe('SessionService', () => {
	let service: MySessionService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MySessionService],
		}).compile();

		service = module.get<MySessionService>(MySessionService);
	});

	it('hope its defined', () => {
		expect(service).toBeDefined();
	});
});
