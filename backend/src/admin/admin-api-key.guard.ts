import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

// حارس بسيط لكل نقاط نهاية /admin/*: يتطلب ترويسة x-admin-token مطابقة لمتغير البيئة
// ADMIN_API_TOKEN. هذا ليس نظام مصادقة كامل (لا مستخدمين/أدوار/جلسات) — فقط حاجز أدنى
// يمنع وصول أي شخص عشوائي لوحة تحكم تكتب في قاعدة البيانات مباشرة. يُستبدل لاحقاً
// بنظام دخول حقيقي لطاقم الدعم الفني إذا احتاج المشروع ذلك عند الإطلاق الفعلي.
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expectedToken = process.env.ADMIN_API_TOKEN;
    if (!expectedToken) {
      throw new InternalServerErrorException('ADMIN_API_TOKEN غير مُعرَّف على السيرفر');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedToken = request.header('x-admin-token');

    if (!providedToken || providedToken !== expectedToken) {
      throw new UnauthorizedException('رمز الدخول للوحة التحكم غير صحيح أو مفقود');
    }

    return true;
  }
}
