import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from 'src/models/signUp.dto';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/password';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService
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
}
