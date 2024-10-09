import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from 'src/models/signUp.dto';
import { SignInDto } from '../models/signIn.dto';
import { AuthService } from './auth.service';
import { skipAuth } from './decorators/skipAuth';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@ApiTags('auth')
@skipAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: SignInDto })
  @Post('login')
  async login(@Request() req: Express.Request) {    
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(RefreshAuthGuard)  
  @Post('refresh')
  async refresh(@Request() req: Express.Request) {
    return this.authService.refresh(req);
  }
}
