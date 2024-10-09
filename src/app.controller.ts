import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { skipAuth } from './auth/decorators/skipAuth';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RefreshAuthGuard } from './auth/guards/refresh-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @skipAuth()
  @Get()
  getHello() {
    return this.appService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiBearerAuth()
  @Get('allUsers')
  getAllUsers() {
    return this.appService.getAllUsers();
  }

  @UseGuards(RefreshAuthGuard)
  @ApiBearerAuth()
  @Get('refreshProfile')
  gettest(@Request() req) {
    return req.user;
  }
}
