import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SendOtpDto } from 'src/dto/send-otp.dto';
import { SignUpDto } from 'src/dto/sign-up.dto';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { AuthService } from './auth.service';
import { skipAuth } from './decorators/skipAuth';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('auth')
@skipAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: SignInDto })
  @Post('log-in')
  async login(@Request() req: Express.Request) {
    return this.authService.login(req.user);
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(ThrottlerGuard)
  @Post('send-otp')
  async sendOTP(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.createAndSendOTP(sendOtpDto);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyOtpDto);
  }

  @Post('delete-expired-otps')
  async deleteExpiredOTPs() {
    return this.authService.cleanupExpiredOTPs();
  }
}
