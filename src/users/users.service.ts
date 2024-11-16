import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SignUpDto } from 'src/dto/sign-up.dto';
import { PrismaService } from 'src/prisma.service';
import { hashPassword } from 'src/utils/password';

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
      const hashedPassword = hashPassword(signUpDto.password);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.prisma.user.create({
        data: {
          name: signUpDto.name,
          password: hashedPassword,
          email: signUpDto.email,
        },
      });
      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException(
            'This email address is already associated with an account. Would you like to log in instead?',
          );
        }
      }
      throw e;
    }
  }
}
