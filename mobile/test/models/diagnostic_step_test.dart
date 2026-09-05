import 'package:flutter_test/flutter_test.dart';
import 'package:smart_technician_app/models/diagnostic_step.dart';

// أشكال JSON الحقيقية مأخوذة من اختبار محرك التشخيص الفعلي في backend/ (Phase 3)
// عبر curl ضد قاعدة بيانات حقيقية، لضمان تطابق النماذج هنا مع استجابات الـ API فعلياً.
void main() {
  test('parses a question step', () {
    final step = DiagnosticStep.fromJson({
      'type': 'question',
      'sessionId': '1b2e7d98-3c74-4df2-904f-3aaed569198d',
      'confidenceScore': 0,
      'questionText': 'هل يعمل المكيف عند الضغط على زر التشغيل؟',
      'answers': [
        {'id': '7e390d99-c650-4756-b131-f26c4f3425f7', 'answerText': 'نعم، يعمل لكن لا يبرد بالشكل المطلوب'},
        {'id': '141e1455-8b16-4819-b3a6-ee4adb92c412', 'answerText': 'لا، لا يستجيب نهائياً عند التشغيل'},
      ],
    });

    expect(step.type, DiagnosticStepType.question);
    expect(step.confidenceScore, 0);
    expect(step.answers, hasLength(2));
    expect(step.answers.first.answerText, 'نعم، يعمل لكن لا يبرد بالشكل المطلوب');
  });

  test('parses a paywall step', () {
    final step = DiagnosticStep.fromJson({
      'type': 'paywall',
      'sessionId': '1b2e7d98-3c74-4df2-904f-3aaed569198d',
      'confidenceScore': 0.85,
      'message': 'تم تحديد المشكلة بدقة 85% — أكمل الدفع لعرض التفاصيل الكاملة والسبب الجذري وقطع الغيار',
      'requiresPayment': true,
    });

    expect(step.type, DiagnosticStepType.paywall);
    expect(step.confidenceScore, 0.85);
    expect(step.message, contains('85%'));
  });

  test('parses a diagnosis step with parts', () {
    final step = DiagnosticStep.fromJson({
      'type': 'diagnosis',
      'sessionId': '1b2e7d98-3c74-4df2-904f-3aaed569198d',
      'confidenceScore': 0.85,
      'diagnosisTitle': 'تجمد الثلج على الوحدة الداخلية — نقص غاز التبريد أو انسداد الفلتر',
      'rootCause': 'نقص في غاز التبريد (فريون) بسبب تسريب في الدائرة.',
      'severityLevel': 'متوسط',
      'parts': [
        {
          'name': 'فلتر هواء داخلي',
          'sku': 'SPLIT-FILT-001',
          'price': '45',
          'storeUrl': 'https://store.example.com/parts/SPLIT-FILT-001',
          'stockStatus': 'available',
          'isRequired': false,
        },
        {
          'name': 'تعبئة غاز تبريد R410A',
          'sku': 'SPLIT-GAS-001',
          'price': '150',
          'storeUrl': 'https://store.example.com/parts/SPLIT-GAS-001',
          'stockStatus': 'available',
          'isRequired': true,
        },
      ],
    });

    expect(step.type, DiagnosticStepType.diagnosis);
    expect(step.parts, hasLength(2));
    expect(step.parts.last.isRequired, true);
    expect(step.parts.last.price, '150');
  });
}
