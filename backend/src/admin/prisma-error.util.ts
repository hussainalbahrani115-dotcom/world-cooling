import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// يحوّل خطأ قيد المفتاح الأجنبي في Prisma (P2003) عند الحذف إلى رسالة عربية واضحة
// بدل خطأ 500 عام. تُستخدم في كل عمليات الحذف بلوحة التحكم.
export async function runOrConflict<T>(operation: () => Promise<T>, message: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new ConflictException(message);
    }
    throw error;
  }
}
