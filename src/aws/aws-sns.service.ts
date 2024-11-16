import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from '@aws-sdk/client-sns';
import { Inject, Injectable } from '@nestjs/common';
import { AWS_SNS_CLIENT } from './aws-sns.provider';

@Injectable()
export class AwsSnsService {
  constructor(
    @Inject(AWS_SNS_CLIENT)
    private readonly snsClient: SNSClient,
  ) {}

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    const params: PublishCommandInput = {
      Message: message,
      PhoneNumber: phoneNumber,
    };

    try {
      await this.snsClient.send(new PublishCommand(params));
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}
