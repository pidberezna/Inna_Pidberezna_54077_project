import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserAccommodationsService } from './user-accommodations.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';

@Controller()
export class UserPhotosAccommodationsController {
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

  @Get('user-places')
  @UseGuards(AuthGuard)
  async showUserAccommodations(@Req() req: AuthenticatedRequest) {
    return await this.userAccommodationsService.showUserAccommodations(
      req.user,
    );
  }
}
