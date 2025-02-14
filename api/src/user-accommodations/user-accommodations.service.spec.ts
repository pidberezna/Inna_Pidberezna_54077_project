import { Test, TestingModule } from '@nestjs/testing';
import { UserAccommodationsService } from './user-accommodations.service';

describe('UserAccommodationsService', () => {
  let service: UserAccommodationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAccommodationsService],
    }).compile();

    service = module.get<UserAccommodationsService>(UserAccommodationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
