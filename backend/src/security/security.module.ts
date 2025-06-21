import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { XssProtectionInterceptor } from './interceptors/xss-protection.interceptor';
import { CsrfGuard } from './guards/csrf.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Module({
  providers: [
    SecurityService,
    XssProtectionInterceptor,
    CsrfGuard,
    RateLimitGuard,
  ],
  exports: [
    SecurityService,
    XssProtectionInterceptor,
    CsrfGuard,
    RateLimitGuard,
  ],
})
export class SecurityModule {}
