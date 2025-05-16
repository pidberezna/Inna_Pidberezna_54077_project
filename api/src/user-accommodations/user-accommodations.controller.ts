import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAccommodationsService } from './user-accommodations.service';
import { AccommodationDto } from './dtos/user-accommodation.dto';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('accommodations')
@Controller('account')
export class UserAccommodationsController {
  constructor(
    private readonly userAccommodationsService: UserAccommodationsService,
  ) {}

  @Post('places')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new accommodation' })
  @ApiResponse({ status: 201, description: 'Accommodation created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAccomodation(
    @Req() req: AuthenticatedRequest,
    @Body() accommodationDto: AccommodationDto,
  ) {
    return this.userAccommodationsService.createAccommodation(
      req.user,
      accommodationDto,
    );
  }

  @Get('places')
  @ApiOperation({ summary: 'Get all accommodations' })
  @ApiResponse({ status: 200, description: 'List of accommodations' })
  async showAllAccommodations() {
    return await this.userAccommodationsService.showAllAccommodations();
  }

  @Get('places/:id')
  @ApiOperation({ summary: 'Get accommodation by ID' })
  @ApiResponse({ status: 200, description: 'Accommodation details' })
  async showAccommodationById(@Param('id') id: string) {
    return await this.userAccommodationsService.showAccommodationById(id);
  }

  @Put('places')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an accommodation' })
  @ApiResponse({ status: 200, description: 'Accommodation updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveAccommodation(
    @Req() req: AuthenticatedRequest,
    @Body('id') id: string,
    @Body() accommodationDto: AccommodationDto,
  ) {
    return await this.userAccommodationsService.saveAccommodation(
      req.user,
      id,
      accommodationDto,
    );
  }
}
