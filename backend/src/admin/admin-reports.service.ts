import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// "نسبة نجاح التشخيص" = عدد الجلسات التي وصلت لعقدة بوابة دفع أو تشخيص (أي أن محرك
// الشجرة نجح في تضييق المشكلة لدرجة كافية) مقسومة على إجمالي الجلسات.
// "نسبة التحويل للدفع" = عدد الجلسات المدفوعة مقسومة على الجلسات التي وصلت لتلك البوابة.
@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [totalSessions, paidSessions, abandonedSessions, reachedGate] = await Promise.all([
      this.prisma.userSession.count(),
      this.prisma.userSession.count({ where: { status: 'paid' } }),
      this.prisma.userSession.count({ where: { status: 'abandoned' } }),
      this.prisma.userSession.count({ where: { currentNode: { nodeType: { in: ['paywall', 'diagnosis'] } } } }),
    ]);

    return {
      totalSessions,
      paidSessions,
      abandonedSessions,
      activeSessions: totalSessions - paidSessions - abandonedSessions,
      reachedDiagnosisGate: reachedGate,
      diagnosisReachRate: rate(reachedGate, totalSessions),
      paymentConversionRate: rate(paidSessions, reachedGate),
    };
  }

  async byAppliance() {
    const appliances = await this.prisma.appliance.findMany({ orderBy: { nameAr: 'asc' } });

    return Promise.all(
      appliances.map(async (appliance) => {
        const [totalSessions, paidSessions, reachedGate] = await Promise.all([
          this.prisma.userSession.count({ where: { applianceId: appliance.id } }),
          this.prisma.userSession.count({ where: { applianceId: appliance.id, status: 'paid' } }),
          this.prisma.userSession.count({
            where: { applianceId: appliance.id, currentNode: { nodeType: { in: ['paywall', 'diagnosis'] } } },
          }),
        ]);

        return {
          applianceId: appliance.id,
          applianceName: appliance.nameAr,
          totalSessions,
          paidSessions,
          reachedDiagnosisGate: reachedGate,
          diagnosisReachRate: rate(reachedGate, totalSessions),
          paymentConversionRate: rate(paidSessions, reachedGate),
        };
      }),
    );
  }
}

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 1000;
}
