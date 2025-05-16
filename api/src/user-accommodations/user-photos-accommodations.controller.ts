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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('accommodations')
@Controller()
export class UserPhotosAccommodationsController {
  constructor(
    private readonly userAccommodationsService: UserAccommodationsService,
  ) {}

  @Post('upload-by-link')
  @ApiOperation({ summary: 'Upload photo by providing a URL' })
  @ApiResponse({ status: 201, description: 'Photo uploaded from link' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        link: {
          type: 'string',
          example: 'https://example.com/photo.jpg',
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Upload multiple photos from local files' })
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.userAccommodationsService.uploadFile(files);
  }

  @Get('user-places')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all accommodations created by the user' })
  @ApiResponse({ status: 200, description: 'List of user accommodations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async showUserAccommodations(@Req() req: AuthenticatedRequest) {
    return await this.userAccommodationsService.showUserAccommodations(
      req.user,
    );
  }
}
