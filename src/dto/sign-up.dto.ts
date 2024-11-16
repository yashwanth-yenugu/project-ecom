import { IsNotEmpty } from 'class-validator';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  /**
   * @example 'yash'
   */
  @IsNotEmpty()
  name: string;
}
