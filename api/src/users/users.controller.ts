import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    console.log('User from request:', req.user);
    return this.usersService.getProfile(req.user);
  }
}
