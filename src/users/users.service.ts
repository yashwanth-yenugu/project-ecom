import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SignUpDto } from 'src/models/signUp.dto';
import { PrismaService } from 'src/prisma.service';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      if ((error.code = 'P2025')) {
        throw new UnauthorizedException();
      }
    }
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const User = await this.prisma.user.create({
        data: {
          username: signUpDto.username,
          password: signUpDto.password,
          email: signUpDto.email,
        },
      });
      return User;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException(
            'There is a unique constraint violation, a new user cannot be created with this email',
          );
        }
      }
      throw e;
    }
  }
}
