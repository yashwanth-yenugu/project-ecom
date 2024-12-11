import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AwsSnsService } from 'src/aws/aws-sns.service';
import { SendOtpDto } from 'src/dto/send-otp.dto';
import { SignUpDto } from 'src/dto/sign-up.dto';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/password';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpExpiryMinutes = 10;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly awsSnsService: AwsSnsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && comparePassword(user.password, pass)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const tokens = await this.getTokens(user.userId, user.email);    
    await this.usersService.updateRefreshTokens(user.email, tokens.refresh_token);
    return tokens
  }

  async signUp(user: SignUpDto) {
    return await this.usersService.signUp(user);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_SECRET'),
        expiresIn: this.config.get<string>('REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(req: any) {
    const refreshToken = req
    ?.get('authorization')
    ?.replace('Bearer', '')
    .trim()
    const emailId = this.jwtService.decode(refreshToken).email
    const user = await this.usersService.findOne(emailId);
    const isValidToken = user.refreshTokens.some((token) => token === refreshToken);
    if(isValidToken) {
      const tokens = await this.getTokens(req.user.userId, req.user.email);
      await this.usersService.updateRefreshTokens(req.user.email, tokens.refresh_token, refreshToken);
      return tokens
    } else {
      throw new UnauthorizedException();
    }
  }

  private generateOTP(): number {
    return +Math.floor(100000 + Math.random() * 999999).toString();
  }

  async createAndSendOTP({ phoneNumber }: SendOtpDto) {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

      // Delete old OTPs for the given phone number
      await this.prisma.otp.deleteMany({
        where: {
          phoneNumber,
        },
      });

      await this.prisma.otp.create({
        data: {
          phoneNumber,
          code: otp,
          expiresAt,
        },
      });

      const message = `Your Park Vaahan verification code is: ${otp}. Valid for ${this.otpExpiryMinutes} minutes.`;
      await this.awsSnsService.sendSMS(phoneNumber, message);

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send OTP: ${error.message}`,
      };
    }
  }

  async verifyOTP({ phoneNumber, code }: VerifyOtpDto) {
    try {
      const otp = await this.prisma.otp.findFirst({
        where: {
          phoneNumber,
          code,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        return {
          success: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Delete OTP
      await this.prisma.otp.delete({
        where: { id: otp.id },
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        access_token: this.jwtService.sign({ phoneNumber }),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to verify OTP: ${error.message}`,
      };
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredOTPs() {
    try {
      const result = await this.prisma.otp.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }],
        },
      });

      const message = `Cleaned up ${result.count} expired/used OTPs`;
      this.logger.log(message);

      return {
        success: true,
        message: `Cleaned up ${result.count} expired/used OTPs`,
      };
    } catch (error) {
      const message = `Failed to cleanup expired OTPs: ${error.message}`;
      this.logger.error(message);

      return {
        success: false,
        message: message,
      };
    }
  }
}
