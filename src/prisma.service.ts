import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private static instance: PrismaService;
  private static isConnected = false;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 2000;

  constructor() {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    PrismaService.instance = this;
  }

  private async retryConnection(
    retries = PrismaService.MAX_RETRIES,
  ): Promise<void> {
    try {
      await this.$connect();
      PrismaService.isConnected = true;
      this.logger.log('DB connection success!');
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(
          `Failed to connect to database. Retrying in ${
            PrismaService.RETRY_DELAY_MS / 1000
          } seconds... (${retries} attempts remaining)`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, PrismaService.RETRY_DELAY_MS),
        );
        await this.retryConnection(retries - 1);
      } else {
        this.logger.error(
          'Failed to connect to database after multiple attempts',
        );
        throw error;
      }
    }
  }

  async onModuleInit() {
    if (!PrismaService.isConnected && this === PrismaService.instance) {
      // Set up event listeners
      this.setupEventListeners();

      // Initialize connection with retry mechanism
      await this.retryConnection();
    }
  }

  private setupEventListeners(): void {
    // Query logging
    this.$on('query', (event: Prisma.QueryEvent) => {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
        if (event.params) {
          this.logger.debug(`Params: ${event.params}`);
        }
      }
    });

    // Error logging
    this.$on('error', (event) => {
      this.logger.error(`Database error: ${event.message}`, event.target);
    });

    // Info logging
    this.$on('info', (event) => {
      this.logger.log(`Database info: ${event.message}`, event.target);
    });

    // Warning logging
    this.$on('warn', (event) => {
      this.logger.warn(`Database warning: ${event.message}`, event.target);
    });
  }

  async onModuleDestroy() {
    if (PrismaService.isConnected && this === PrismaService.instance) {
      try {
        await this.$disconnect();
        PrismaService.isConnected = false;
        this.logger.log('Database connection closed successfully');
      } catch (error) {
        this.logger.error('Error while disconnecting from database:', error);
        throw error;
      }
    }
  }

  // Helper method for transactions
  async executeInTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      try {
        return await fn(prisma);
      } catch (error) {
        this.logger.error('Transaction failed:', error);
        throw error;
      }
    });
  }

  // Clean up resources and reset connection
  async cleanUp(): Promise<void> {
    if (PrismaService.isConnected) {
      await this.$disconnect();
      PrismaService.isConnected = false;
      this.logger.log('Database resources cleaned up');
    }
  }
}
