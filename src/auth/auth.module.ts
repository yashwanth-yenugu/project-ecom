import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AwsModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './stategies/jwt.strategy';
import { LocalStrategy } from './stategies/local.strategy';
import { RefreshStrategy } from './stategies/refresh.stategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ThrottlerModule.forRoot([
      {
        ttl: 30000,
        limit: 1,
      },
    ]),
    AwsModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
