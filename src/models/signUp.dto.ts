import { IsNotEmpty } from 'class-validator';
import { SignInDto } from './signIn.dto';

export class SignUpDto extends SignInDto {
  /**
   * @example 'yash'
   */
  @IsNotEmpty()
  username: string;
}
