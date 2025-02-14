import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Accommodation } from './entities/user-accommodation.entity';
import { Model, Types } from 'mongoose';
import { AccommodationDto } from './dtos/user-accommodation.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
const download = require('image-downloader');

@Injectable()
export class UserAccommodationsService {
  constructor(
    @InjectModel(Accommodation.name)
    private accommodationModel: Model<Accommodation>,
    private readonly jwtService: JwtService,
  ) {}

  async uploadByLink(link: string) {
    const newName = `photo${Date.now()}.jpg`;
    const uploadsDir = path.join(process.cwd(), 'uploads');

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const destPath = path.join(uploadsDir, newName);
      await download.image({
        url: link,
        dest: destPath,
      });

      return newName;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async uploadFile(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    try {
      return files.map((file) => {
        if (!file.path) {
          throw new BadRequestException('File path is undefined');
        }
        return file.filename;
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload files');
    }
  }

  async createAccommodation(user: User, accommodationDto: AccommodationDto) {
    try {
      const owner = new Types.ObjectId(user._id);
      const createdAccommodation = new this.accommodationModel({
        ...accommodationDto,
        owner,
      });
      return createdAccommodation.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create accommodation');
    }
  }

  async showUserAccommodations(user: User) {
    try {
      const id = new Types.ObjectId(user._id);
      const userPlaces = await this.accommodationModel.find({ owner: id });
      return userPlaces;
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not retrieve accommodations',
      );
    }
  }

  async showAllAccommodations() {
    try {
      return await this.accommodationModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not retrieve accommodations',
      );
    }
  }

  async showAccommodationById(id: string) {
    if (!id) {
      throw new BadRequestException('Accommodation id must be provided');
    }
    try {
      const accommodation = await this.accommodationModel.findById(id);
      if (!accommodation) {
        throw new NotFoundException('Accommodation not found');
      }
      return accommodation;
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not retrieve accommodation',
      );
    }
  }

  async saveAccommodation(
    user: User,
    id: string,
    accommodationDto: AccommodationDto,
  ) {
    try {
      const accomDoc = await this.accommodationModel.findById(id);
      if (!accomDoc) {
        throw new NotFoundException('Accommodation not found');
      }
      if (user._id.toString() !== accomDoc.owner.toString()) {
        throw new ForbiddenException(
          'You are not the owner of this accommodation',
        );
      }

      accomDoc.set({ ...accommodationDto });
      return await accomDoc.save();
    } catch (error) {
      throw new InternalServerErrorException('Could not update accommodation');
    }
  }
}
