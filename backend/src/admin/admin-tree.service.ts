import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNodeDto, UpdateNodeDto } from './dto/node.dto';
import { CreateAnswerDto, UpdateAnswerDto } from './dto/answer.dto';
import { CreateDiagnosisDto, UpdateDiagnosisDto, ReplaceDiagnosisPartsDto } from './dto/diagnosis.dto';

@Injectable()
export class AdminTreeService {
  constructor(private readonly prisma: PrismaService) {}

  // شجرة الجهاز كاملة (كل العقد + إجاباتها + تشخيصها إن وُجد) لعرضها/تحريرها في لوحة التحكم.
  async getTree(applianceId: string) {
    const appliance = await this.prisma.appliance.findUnique({ where: { id: applianceId } });
    if (!appliance) throw new NotFoundException('الجهاز غير موجود');

    const nodes = await this.prisma.diagnosticNode.findMany({
      where: { applianceId },
      include: {
        answers: true,
        diagnoses: { include: { parts: { include: { part: true } } } },
      },
      orderBy: { id: 'asc' },
    });

    return { appliance, nodes };
  }

  async createNode(applianceId: string, dto: CreateNodeDto) {
    const appliance = await this.prisma.appliance.findUnique({ where: { id: applianceId } });
    if (!appliance) throw new NotFoundException('الجهاز غير موجود');

    if (dto.nodeType === 'question' && !dto.questionText) {
      throw new BadRequestException('عقدة من نوع سؤال تحتاج questionText');
    }
    if (dto.subsystemId) {
      await this.ensureSubsystemBelongsToAppliance(dto.subsystemId, applianceId);
    }
    if (dto.parentNodeId) {
      await this.ensureNodeBelongsToAppliance(dto.parentNodeId, applianceId);
    }

    return this.prisma.diagnosticNode.create({
      data: {
        applianceId,
        nodeType: dto.nodeType,
        questionText: dto.questionText,
        subsystemId: dto.subsystemId,
        parentNodeId: dto.parentNodeId,
        confidenceWeight: dto.confidenceWeight,
      },
    });
  }

  async updateNode(id: string, dto: UpdateNodeDto) {
    const node = await this.ensureNodeExists(id);

    if (dto.subsystemId) {
      await this.ensureSubsystemBelongsToAppliance(dto.subsystemId, node.applianceId);
    }
    if (dto.parentNodeId) {
      if (dto.parentNodeId === id) {
        throw new BadRequestException('لا يمكن أن تكون العقدة أباً لنفسها');
      }
      await this.ensureNodeBelongsToAppliance(dto.parentNodeId, node.applianceId);
      await this.ensureNoCycle(id, dto.parentNodeId);
    }

    return this.prisma.diagnosticNode.update({
      where: { id },
      data: {
        nodeType: dto.nodeType,
        questionText: dto.questionText,
        subsystemId: dto.subsystemId,
        parentNodeId: dto.parentNodeId,
        confidenceWeight: dto.confidenceWeight,
      },
    });
  }

  async removeNode(id: string) {
    await this.ensureNodeExists(id);

    // ⚠️ next_node_id / parent_node_id / current_node_id علاقات اختيارية، وPrisma يولّد
    // لها افتراضياً ON DELETE SET NULL — أي أن قيد المفتاح الأجنبي وحده لن يمنع الحذف،
    // بل سيُصمِت الحذف ويُفرّغ تلك الحقول (يكسر إجابات تشير لهذه العقدة، أو يجعل عقدها
    // الفرعية جذوراً جديدة بلا تنبيه). لذا يجب التحقق يدوياً قبل الحذف بدل الاعتماد على
    // خطأ قاعدة البيانات.
    const [incomingAnswers, childNodes, linkedDiagnosis, linkedSessions] = await Promise.all([
      this.prisma.nodeAnswer.count({ where: { nextNodeId: id } }),
      this.prisma.diagnosticNode.count({ where: { parentNodeId: id } }),
      this.prisma.diagnosis.count({ where: { finalNodeId: id } }),
      this.prisma.userSession.count({ where: { currentNodeId: id } }),
    ]);
    if (incomingAnswers > 0 || childNodes > 0 || linkedDiagnosis > 0 || linkedSessions > 0) {
      throw new BadRequestException(
        'لا يمكن حذف هذه العقدة: يوجد إجابات أخرى تشير إليها، أو عقد فرعية تابعة لها، أو تشخيص مرتبط بها، أو جلسات مستخدمين تقف عندها حالياً. أزل هذه الروابط أولاً (أعد توجيه الإجابات، احذف الأبناء، احذف التشخيص).',
      );
    }

    await this.prisma.nodeAnswer.deleteMany({ where: { nodeId: id } });
    await this.prisma.diagnosticNode.delete({ where: { id } });
  }

  // ===================== الإجابات =====================

  async createAnswer(nodeId: string, dto: CreateAnswerDto) {
    const node = await this.ensureNodeExists(nodeId);
    if (dto.nextNodeId) {
      await this.ensureNodeBelongsToAppliance(dto.nextNodeId, node.applianceId);
    }
    return this.prisma.nodeAnswer.create({
      data: { nodeId, answerText: dto.answerText, nextNodeId: dto.nextNodeId },
    });
  }

  async updateAnswer(id: string, dto: UpdateAnswerDto) {
    const answer = await this.prisma.nodeAnswer.findUnique({ where: { id }, include: { node: true } });
    if (!answer) throw new NotFoundException('الإجابة غير موجودة');
    if (dto.nextNodeId) {
      await this.ensureNodeBelongsToAppliance(dto.nextNodeId, answer.node.applianceId);
    }
    return this.prisma.nodeAnswer.update({
      where: { id },
      data: { answerText: dto.answerText, nextNodeId: dto.nextNodeId },
    });
  }

  async removeAnswer(id: string) {
    const answer = await this.prisma.nodeAnswer.findUnique({ where: { id } });
    if (!answer) throw new NotFoundException('الإجابة غير موجودة');
    await this.prisma.nodeAnswer.delete({ where: { id } });
  }

  // ===================== التشخيص =====================

  async createDiagnosis(nodeId: string, dto: CreateDiagnosisDto) {
    const node = await this.ensureNodeExists(nodeId);
    if (node.nodeType !== 'diagnosis') {
      throw new BadRequestException('لا يمكن إضافة تشخيص إلا لعقدة من نوع diagnosis');
    }
    const existing = await this.prisma.diagnosis.findFirst({ where: { finalNodeId: nodeId } });
    if (existing) {
      throw new BadRequestException('هذه العقدة تملك تشخيصاً بالفعل — استخدم التحديث بدلاً من الإنشاء');
    }
    await this.ensurePartsExist(dto.parts.map((p) => p.partId));

    return this.prisma.$transaction(async (tx) => {
      const diagnosis = await tx.diagnosis.create({
        data: {
          finalNodeId: nodeId,
          diagnosisTitle: dto.diagnosisTitle,
          rootCause: dto.rootCause,
          severityLevel: dto.severityLevel,
        },
      });
      if (dto.parts.length > 0) {
        await tx.diagnosisPart.createMany({
          data: dto.parts.map((p) => ({ diagnosisId: diagnosis.id, partId: p.partId, isRequired: p.isRequired })),
        });
      }
      return tx.diagnosis.findUniqueOrThrow({
        where: { id: diagnosis.id },
        include: { parts: { include: { part: true } } },
      });
    });
  }

  async updateDiagnosis(id: string, dto: UpdateDiagnosisDto) {
    await this.ensureDiagnosisExists(id);
    return this.prisma.diagnosis.update({
      where: { id },
      data: {
        diagnosisTitle: dto.diagnosisTitle,
        rootCause: dto.rootCause,
        severityLevel: dto.severityLevel,
      },
    });
  }

  async replaceDiagnosisParts(id: string, dto: ReplaceDiagnosisPartsDto) {
    await this.ensureDiagnosisExists(id);
    await this.ensurePartsExist(dto.parts.map((p) => p.partId));

    return this.prisma.$transaction(async (tx) => {
      await tx.diagnosisPart.deleteMany({ where: { diagnosisId: id } });
      if (dto.parts.length > 0) {
        await tx.diagnosisPart.createMany({
          data: dto.parts.map((p) => ({ diagnosisId: id, partId: p.partId, isRequired: p.isRequired })),
        });
      }
      return tx.diagnosis.findUniqueOrThrow({
        where: { id },
        include: { parts: { include: { part: true } } },
      });
    });
  }

  async removeDiagnosis(id: string) {
    await this.ensureDiagnosisExists(id);
    await this.prisma.$transaction([
      this.prisma.diagnosisPart.deleteMany({ where: { diagnosisId: id } }),
      this.prisma.diagnosis.delete({ where: { id } }),
    ]);
  }

  // ===================== مساعدات =====================

  private async ensureNodeExists(id: string) {
    const node = await this.prisma.diagnosticNode.findUnique({ where: { id } });
    if (!node) throw new NotFoundException('عقدة التشخيص غير موجودة');
    return node;
  }

  private async ensureDiagnosisExists(id: string) {
    const diagnosis = await this.prisma.diagnosis.findUnique({ where: { id } });
    if (!diagnosis) throw new NotFoundException('التشخيص غير موجود');
    return diagnosis;
  }

  private async ensureNodeBelongsToAppliance(nodeId: string, applianceId: string) {
    const node = await this.prisma.diagnosticNode.findUnique({ where: { id: nodeId } });
    if (!node || node.applianceId !== applianceId) {
      throw new BadRequestException('العقدة المشار إليها لا تخص هذا الجهاز');
    }
  }

  private async ensureSubsystemBelongsToAppliance(subsystemId: string, applianceId: string) {
    const subsystem = await this.prisma.subsystem.findUnique({ where: { id: subsystemId } });
    if (!subsystem || subsystem.applianceId !== applianceId) {
      throw new BadRequestException('النظام الفرعي المشار إليه لا يخص هذا الجهاز');
    }
  }

  private async ensurePartsExist(partIds: string[]) {
    const uniqueIds = [...new Set(partIds)];
    if (uniqueIds.length === 0) return;
    const count = await this.prisma.part.count({ where: { id: { in: uniqueIds } } });
    if (count !== uniqueIds.length) {
      throw new BadRequestException('إحدى قطع الغيار المحددة غير موجودة');
    }
  }

  // يمنع إنشاء حلقة في الشجرة عند تغيير أب العقدة (parentNodeId) إلى أحد أحفادها.
  private async ensureNoCycle(nodeId: string, newParentId: string) {
    let currentId: string | null = newParentId;
    const visited = new Set<string>();
    while (currentId) {
      if (currentId === nodeId) {
        throw new BadRequestException('لا يمكن أن يؤدي هذا التغيير إلى حلقة في شجرة القرار');
      }
      if (visited.has(currentId)) break;
      visited.add(currentId);
      const parent: { parentNodeId: string | null } | null = await this.prisma.diagnosticNode.findUnique({
        where: { id: currentId },
        select: { parentNodeId: true },
      });
      currentId = parent?.parentNodeId ?? null;
    }
  }
}
