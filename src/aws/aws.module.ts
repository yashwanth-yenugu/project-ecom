import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsSnsProvider } from './aws-sns.provider';
import { AwsSnsService } from './aws-sns.service';

@Module({
  imports: [ConfigModule],
  providers: [AwsSnsProvider, AwsSnsService],
  exports: [AwsSnsService],
})
export class AwsModule {}
