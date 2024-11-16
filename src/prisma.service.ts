import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }
  async onModuleInit() {
    this.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.debug('Query: ' + event.query);
      this.logger.debug('Duration: ' + event.duration + 'ms');
    });
    this.$on('error', (event) => {
      this.logger.verbose(event.target);
    });
    await this.$connect();
  }
}
