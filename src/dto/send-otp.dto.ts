import { Transform } from 'class-transformer';
import { IsPhoneNumber, Matches, ValidateIf } from 'class-validator';

export class SendOtpDto {
  /**
   * @example '+919876543210'
   */
  @Transform(({ value }) => {
    // If number doesn't start with +, add it
    if (typeof value === 'string' && !value.startsWith('+')) {
      return `+${value}`;
    }
    return value;
  })
  @IsPhoneNumber()
  @Matches(/^\+91[1-9]\d{9}$/, {
    message: 'Phone number must start with +91 followed by 10 digits',
  })
  @ValidateIf((object, value) => {
    if (!value) return false;
    // Remove all spaces and special characters except + for validation
    const cleanedValue = value.replace(/[^+\d]/g, '');
    return cleanedValue.length > 0;
  })
  phoneNumber: string;

  constructor(partial: Partial<SendOtpDto>) {
    Object.assign(this, partial);
  }
}
