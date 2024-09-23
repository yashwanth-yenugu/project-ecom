import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'Hello Yash!';
  }

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }
}
