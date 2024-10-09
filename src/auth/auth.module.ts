import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './stategies/jwt.strategy';
import { LocalStrategy } from './stategies/local.strategy';
import { RefreshStrategy } from './stategies/refresh.stategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
