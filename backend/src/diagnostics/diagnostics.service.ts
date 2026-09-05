import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiagnosticNode, Prisma, UserSession } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto } from './dto/start-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { DiagnosticStepResponse } from './diagnostics.types';

// الحد الأقصى لنسبة الثقة (100%). العتبة الفعلية التي يُفعَّل عندها الدفع محدَّدة
// ضمنياً عبر بنية الشجرة نفسها (متى تصل الأسئلة إلى عقدة من نوع paywall)، وليست
// رقماً مفروضاً في الكود — بما يوافق مبدأ "Content-driven, not code-driven".
const MAX_CONFIDENCE = 1;

@Injectable()
export class DiagnosticsService {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(dto: StartSessionDto): Promise<DiagnosticStepResponse> {
    const appliance = await this.prisma.appliance.findUnique({ where: { id: dto.applianceId } });
    if (!appliance) throw new NotFoundException('الجهاز غير موجود');

    if (dto.symptomId) {
      const symptom = await this.prisma.symptom.findUnique({ where: { id: dto.symptomId } });
      if (!symptom || symptom.applianceId !== dto.applianceId) {
        throw new BadRequestException('العرض المحدد لا يخص هذا الجهاز');
      }
      // ملاحظة: لا يوجد بعد ربط مباشر بين الأعراض وعقد الشجرة في المخطط، لذا كل الأعراض
      // تقود حالياً لنفس عقدة الجذر. عند بناء لوحة التحكم (Phase 5) يمكن لكل عرض أن
      // يحدد عقدة بداية مختلفة (تخطي الأسئلة العامة) دون أي تعديل في هذا المحرك.
    }

    const rootNode = await this.prisma.diagnosticNode.findFirst({
      where: { applianceId: dto.applianceId, parentNodeId: null, nodeType: 'question' },
    });
    if (!rootNode) {
      throw new NotFoundException('لا توجد شجرة تشخيص مُعدة لهذا الجهاز بعد');
    }

    const session = await this.prisma.userSession.create({
      data: {
        userId: dto.userId,
        applianceId: dto.applianceId,
        currentNodeId: rootNode.id,
        confidenceScore: 0,
        answersLog: [],
        status: 'active',
      },
    });

    return this.buildResponse(session, rootNode);
  }

  async getSession(sessionId: string): Promise<DiagnosticStepResponse> {
    const session = await this.getSessionOrThrow(sessionId);
    const node = await this.getNodeOrThrow(session.currentNodeId);
    return this.buildResponse(session, node);
  }

  async submitAnswer(sessionId: string, dto: SubmitAnswerDto): Promise<DiagnosticStepResponse> {
    const session = await this.getSessionOrThrow(sessionId);
    const currentNode = await this.getNodeOrThrow(session.currentNodeId);

    if (currentNode.nodeType !== 'question') {
      throw new BadRequestException('لا يمكن الإجابة على هذه العقدة — الجلسة ليست في مرحلة سؤال');
    }

    const answer = await this.prisma.nodeAnswer.findUnique({
      where: { id: dto.nodeAnswerId },
      include: { nextNode: true },
    });
    if (!answer || answer.nodeId !== currentNode.id) {
      throw new BadRequestException('إجابة غير صالحة لهذا السؤال');
    }
    if (!answer.nextNode) {
      throw new BadRequestException('شجرة التشخيص غير مكتملة — لا توجد عقدة تالية لهذه الإجابة');
    }

    const nextNode = answer.nextNode;
    const newConfidence = Math.min(
      MAX_CONFIDENCE,
      (session.confidenceScore ?? 0) + (nextNode.confidenceWeight ?? 0),
    );

    const previousLog = Array.isArray(session.answersLog) ? session.answersLog : [];
    const answersLog: Prisma.InputJsonValue[] = [
      ...(previousLog as Prisma.InputJsonValue[]),
      {
        nodeId: currentNode.id,
        questionText: currentNode.questionText,
        answerId: answer.id,
        answerText: answer.answerText,
        at: new Date().toISOString(),
      },
    ];

    const updatedSession = await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        currentNodeId: nextNode.id,
        confidenceScore: newConfidence,
        answersLog,
      },
    });

    return this.buildResponse(updatedSession, nextNode);
  }

  // ⚠️ نقطة نهاية مؤقتة لأغراض الاختبار المحلي فقط، إلى حين ربط بوابة الدفع الحقيقية
  // (HyperPay/Moyasar) في Phase 4. يجب استبدالها بمعالج Webhook يستقبل تأكيد الدفع
  // الفعلي من بوابة الدفع، لا أن يُستدعى مباشرة من العميل.
  async simulatePayment(sessionId: string): Promise<DiagnosticStepResponse> {
    const session = await this.getSessionOrThrow(sessionId);

    const updatedSession = await this.prisma.userSession.update({
      where: { id: session.id },
      data: { status: 'paid' },
    });

    await this.prisma.payment.create({
      data: {
        sessionId: session.id,
        amount: 20,
        currency: 'SAR',
        status: 'succeeded',
        gatewayRef: `TEST-${Date.now()}`,
        paidAt: new Date(),
      },
    });

    const node = await this.getNodeOrThrow(updatedSession.currentNodeId);
    return this.buildResponse(updatedSession, node);
  }

  private async buildResponse(session: UserSession, node: DiagnosticNode): Promise<DiagnosticStepResponse> {
    if (node.nodeType === 'question') {
      const answers = await this.prisma.nodeAnswer.findMany({ where: { nodeId: node.id } });
      return {
        type: 'question',
        sessionId: session.id,
        confidenceScore: session.confidenceScore ?? 0,
        questionText: node.questionText ?? '',
        answers: answers.map((a) => ({ id: a.id, answerText: a.answerText })),
      };
    }

    if (node.nodeType === 'paywall') {
      if (session.status === 'paid') {
        const continueAnswer = await this.prisma.nodeAnswer.findFirst({
          where: { nodeId: node.id },
          include: { nextNode: true },
        });
        if (continueAnswer?.nextNode) {
          const advancedSession = await this.prisma.userSession.update({
            where: { id: session.id },
            data: { currentNodeId: continueAnswer.nextNode.id },
          });
          return this.buildResponse(advancedSession, continueAnswer.nextNode);
        }
      }
      return this.paywallResponse(session);
    }

    if (node.nodeType === 'diagnosis') {
      if (session.status !== 'paid') {
        // شبكة أمان: حتى لو وصلت الجلسة لعقدة تشخيص دون المرور بعقدة paywall صريحة
        // (بناءً على تصميم شجرة مختلف)، لا يُكشف التشخيص الكامل قبل تأكيد الدفع.
        return this.paywallResponse(session);
      }

      const diagnosis = await this.prisma.diagnosis.findFirst({
        where: { finalNodeId: node.id },
        include: { parts: { include: { part: true } } },
      });
      if (!diagnosis) {
        throw new NotFoundException('لم يتم العثور على نتيجة تشخيص مرتبطة بهذه العقدة');
      }

      return {
        type: 'diagnosis',
        sessionId: session.id,
        confidenceScore: session.confidenceScore ?? 0,
        diagnosisTitle: diagnosis.diagnosisTitle,
        rootCause: diagnosis.rootCause,
        severityLevel: diagnosis.severityLevel,
        parts: diagnosis.parts.map((dp) => ({
          name: dp.part.name,
          sku: dp.part.sku,
          price: dp.part.price.toString(),
          storeUrl: dp.part.storeUrl,
          stockStatus: dp.part.stockStatus,
          isRequired: dp.isRequired,
        })),
      };
    }

    throw new BadRequestException(`نوع عقدة غير معروف: ${node.nodeType}`);
  }

  private paywallResponse(session: UserSession): DiagnosticStepResponse {
    const percentage = Math.round((session.confidenceScore ?? 0) * 100);
    return {
      type: 'paywall',
      sessionId: session.id,
      confidenceScore: session.confidenceScore ?? 0,
      message: `تم تحديد المشكلة بدقة ${percentage}% — أكمل الدفع لعرض التفاصيل الكاملة والسبب الجذري وقطع الغيار`,
      requiresPayment: true,
    };
  }

  private async getSessionOrThrow(id: string): Promise<UserSession> {
    const session = await this.prisma.userSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('الجلسة غير موجودة');
    return session;
  }

  private async getNodeOrThrow(id: string | null): Promise<DiagnosticNode> {
    if (!id) throw new NotFoundException('الجلسة لا تملك عقدة حالية');
    const node = await this.prisma.diagnosticNode.findUnique({ where: { id } });
    if (!node) throw new NotFoundException('عقدة التشخيص غير موجودة');
    return node;
  }
}
