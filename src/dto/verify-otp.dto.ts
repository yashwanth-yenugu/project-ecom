import { IsNumber, Max, Min } from 'class-validator';
import { SendOtpDto } from './send-otp.dto';

export class VerifyOtpDto extends SendOtpDto {
  @IsNumber()
  @Min(100000)
  @Max(999999)
  code: number;
}
