import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  /**
   * @example 'yash'
   */
  @IsNotEmpty()
  username: string;

  /**
   * @example 'admin
   */
  @IsNotEmpty()
  password: string;
}
