import { SNSClient } from '@aws-sdk/client-sns';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const AWS_SNS_CLIENT = 'AWS_SNS_CLIENT';

export const AwsSnsProvider: Provider = {
  provide: AWS_SNS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new SNSClient({
      region: configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  },
};
