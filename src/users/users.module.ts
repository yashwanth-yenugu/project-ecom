import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from './users.service';

@Module({
  imports: [JwtModule],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
