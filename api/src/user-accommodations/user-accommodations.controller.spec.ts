import { Test, TestingModule } from '@nestjs/testing';
import { UserAccommodationsController } from './user-accommodations.controller';

describe('UserAccommodationsController', () => {
  let controller: UserAccommodationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAccommodationsController],
    }).compile();

    controller = module.get<UserAccommodationsController>(UserAccommodationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
