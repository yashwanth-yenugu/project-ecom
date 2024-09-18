import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { skipAuth } from './decorators/skipAuth';
import { LocalAuthGuard } from './local-auth.guard';
import { SignInDto } from './models/signIn.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @skipAuth()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: SignInDto })
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
