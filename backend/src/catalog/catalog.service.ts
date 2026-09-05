import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listAppliances() {
    return this.prisma.appliance.findMany({
      orderBy: [{ category: 'asc' }, { nameAr: 'asc' }],
    });
  }

  async listSymptoms(applianceId: string) {
    const appliance = await this.prisma.appliance.findUnique({ where: { id: applianceId } });
    if (!appliance) throw new NotFoundException('الجهاز غير موجود');

    return this.prisma.symptom.findMany({
      where: { applianceId },
      orderBy: { title: 'asc' },
    });
  }
}
