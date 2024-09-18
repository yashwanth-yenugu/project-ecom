import { SetMetadata } from '@nestjs/common';

export const IS_SKIP_AUTH_KEY = 'isPublic';
export const skipAuth = () => SetMetadata(IS_SKIP_AUTH_KEY, true);
