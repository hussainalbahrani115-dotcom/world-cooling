import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplianceDto, UpdateApplianceDto } from './dto/appliance.dto';
import { CreateSubsystemDto, UpdateSubsystemDto } from './dto/subsystem.dto';
import { CreateSymptomDto, UpdateSymptomDto } from './dto/symptom.dto';
import { CreatePartDto, UpdatePartDto } from './dto/part.dto';
import { runOrConflict } from './prisma-error.util';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== الأجهزة =====================

  listAppliances() {
    return this.prisma.appliance.findMany({ orderBy: [{ category: 'asc' }, { nameAr: 'asc' }] });
  }

  async getAppliance(id: string) {
    const appliance = await this.prisma.appliance.findUnique({
      where: { id },
      include: { subsystems: true, symptoms: true },
    });
    if (!appliance) throw new NotFoundException('الجهاز غير موجود');
    return appliance;
  }

  createAppliance(dto: CreateApplianceDto) {
    return this.prisma.appliance.create({ data: dto });
  }

  async updateAppliance(id: string, dto: UpdateApplianceDto) {
    await this.ensureApplianceExists(id);
    return this.prisma.appliance.update({ where: { id }, data: dto });
  }

  async removeAppliance(id: string) {
    await this.ensureApplianceExists(id);
    await runOrConflict(
      () => this.prisma.appliance.delete({ where: { id } }),
      'لا يمكن حذف هذا الجهاز لوجود أنظمة فرعية أو أعراض أو عقد تشخيص أو جلسات مرتبطة به. احذفها أولاً.',
    );
  }

  // ===================== الأنظمة الفرعية =====================

  async listSubsystems(applianceId: string) {
    await this.ensureApplianceExists(applianceId);
    return this.prisma.subsystem.findMany({ where: { applianceId }, orderBy: { nameAr: 'asc' } });
  }

  async createSubsystem(applianceId: string, dto: CreateSubsystemDto) {
    await this.ensureApplianceExists(applianceId);
    return this.prisma.subsystem.create({ data: { ...dto, applianceId } });
  }

  async updateSubsystem(id: string, dto: UpdateSubsystemDto) {
    await this.ensureSubsystemExists(id);
    return this.prisma.subsystem.update({ where: { id }, data: dto });
  }

  async removeSubsystem(id: string) {
    await this.ensureSubsystemExists(id);

    // ⚠️ symptoms.subsystem_id وdiagnostic_nodes.subsystem_id علاقتان اختياريتان
    // (ON DELETE SET NULL) — قيد المفتاح الأجنبي وحده لن يمنع الحذف، بل سيُفرّغ هذه
    // الحقول بصمت. نتحقق يدوياً لمنع فقدان التصنيف دون تنبيه صاحب لوحة التحكم.
    const [linkedSymptoms, linkedNodes] = await Promise.all([
      this.prisma.symptom.count({ where: { subsystemId: id } }),
      this.prisma.diagnosticNode.count({ where: { subsystemId: id } }),
    ]);
    if (linkedSymptoms > 0 || linkedNodes > 0) {
      throw new BadRequestException(
        'لا يمكن حذف هذا النظام الفرعي لارتباطه بأعراض أو عقد تشخيص. أزل الارتباط أولاً (أو انقلها لنظام فرعي آخر).',
      );
    }

    await this.prisma.subsystem.delete({ where: { id } });
  }

  // ===================== الأعراض =====================

  async listSymptoms(applianceId: string) {
    await this.ensureApplianceExists(applianceId);
    return this.prisma.symptom.findMany({ where: { applianceId }, orderBy: { title: 'asc' } });
  }

  async createSymptom(applianceId: string, dto: CreateSymptomDto) {
    await this.ensureApplianceExists(applianceId);
    if (dto.subsystemId) {
      const subsystem = await this.prisma.subsystem.findUnique({ where: { id: dto.subsystemId } });
      if (!subsystem || subsystem.applianceId !== applianceId) {
        throw new BadRequestException('النظام الفرعي المحدد لا يخص هذا الجهاز');
      }
    }
    return this.prisma.symptom.create({ data: { ...dto, applianceId } });
  }

  async updateSymptom(id: string, dto: UpdateSymptomDto) {
    const symptom = await this.prisma.symptom.findUnique({ where: { id } });
    if (!symptom) throw new NotFoundException('العرض غير موجود');
    if (dto.subsystemId) {
      const subsystem = await this.prisma.subsystem.findUnique({ where: { id: dto.subsystemId } });
      if (!subsystem || subsystem.applianceId !== symptom.applianceId) {
        throw new BadRequestException('النظام الفرعي المحدد لا يخص هذا الجهاز');
      }
    }
    return this.prisma.symptom.update({ where: { id }, data: dto });
  }

  async removeSymptom(id: string) {
    const symptom = await this.prisma.symptom.findUnique({ where: { id } });
    if (!symptom) throw new NotFoundException('العرض غير موجود');
    await this.prisma.symptom.delete({ where: { id } });
  }

  // ===================== قطع الغيار =====================

  listParts() {
    return this.prisma.part.findMany({ orderBy: { name: 'asc' } });
  }

  async createPart(dto: CreatePartDto) {
    try {
      return await this.prisma.part.create({ data: dto as Prisma.PartCreateInput });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('رقم القطعة (SKU) مستخدم بالفعل');
      }
      throw error;
    }
  }

  async updatePart(id: string, dto: UpdatePartDto) {
    await this.ensurePartExists(id);
    try {
      return await this.prisma.part.update({ where: { id }, data: dto as Prisma.PartUpdateInput });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('رقم القطعة (SKU) مستخدم بالفعل');
      }
      throw error;
    }
  }

  async removePart(id: string) {
    await this.ensurePartExists(id);
    await runOrConflict(
      () => this.prisma.part.delete({ where: { id } }),
      'لا يمكن حذف هذه القطعة لارتباطها بتشخيص واحد أو أكثر. أزل الارتباط أولاً.',
    );
  }

  // ===================== مساعدات =====================

  private async ensureApplianceExists(id: string) {
    const appliance = await this.prisma.appliance.findUnique({ where: { id } });
    if (!appliance) throw new NotFoundException('الجهاز غير موجود');
    return appliance;
  }

  private async ensureSubsystemExists(id: string) {
    const subsystem = await this.prisma.subsystem.findUnique({ where: { id } });
    if (!subsystem) throw new NotFoundException('النظام الفرعي غير موجود');
    return subsystem;
  }

  private async ensurePartExists(id: string) {
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) throw new NotFoundException('القطعة غير موجودة');
    return part;
  }
}
