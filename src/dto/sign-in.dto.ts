import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  /**
   * @example 'yash@mail.in'
   */
  @IsNotEmpty()
  email: string;

  /**
   * @example 'admin
   */
  @IsNotEmpty()
  password: string;
}
