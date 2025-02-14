import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserAccommodationsService } from './user-accommodations.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AccommodationDto } from './dtos/user-accommodation.dto';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';

@Controller()
export class UserAccommodationsController {
  constructor(
    private readonly userAccommodationsService: UserAccommodationsService,
  ) {}

  @Post('upload-by-link')
  async uploadByLink(@Body('link') link: string) {
    return this.userAccommodationsService.uploadByLink(link);
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('photos', 100, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.userAccommodationsService.uploadFile(files);
  }

  @Post('places')
  @UseGuards(AuthGuard)
  async createAccomodation(
    @Req() req: AuthenticatedRequest,
    @Body() accommodationDto: AccommodationDto,
  ) {
    return this.userAccommodationsService.createAccommodation(
      req.user,
      accommodationDto,
    );
  }

  @Get('user-places')
  @UseGuards(AuthGuard)
  async showUserAccommodations(@Req() req: AuthenticatedRequest) {
    return await this.userAccommodationsService.showUserAccommodations(
      req.user,
    );
  }

  @Get('places')
  async showAllAccommodations() {
    return await this.userAccommodationsService.showAllAccommodations();
  }

  @Get('places/:id')
  async showAccommodationById(@Param('id') id: string) {
    return await this.userAccommodationsService.showAccommodationById(id);
  }

  @Put('places')
  @UseGuards(AuthGuard)
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
