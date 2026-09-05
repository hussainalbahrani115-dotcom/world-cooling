enum DiagnosticStepType { question, paywall, diagnosis }

class AnswerOption {
  final String id;
  final String answerText;

  AnswerOption({required this.id, required this.answerText});

  factory AnswerOption.fromJson(Map<String, dynamic> json) {
    return AnswerOption(
      id: json['id'] as String,
      answerText: json['answerText'] as String,
    );
  }
}

class DiagnosisPartInfo {
  final String name;
  final String sku;
  final String price;
  final String storeUrl;
  final String stockStatus;
  final bool isRequired;

  DiagnosisPartInfo({
    required this.name,
    required this.sku,
    required this.price,
    required this.storeUrl,
    required this.stockStatus,
    required this.isRequired,
  });

  factory DiagnosisPartInfo.fromJson(Map<String, dynamic> json) {
    return DiagnosisPartInfo(
      name: json['name'] as String,
      sku: json['sku'] as String,
      price: json['price'] as String,
      storeUrl: json['storeUrl'] as String,
      stockStatus: json['stockStatus'] as String,
      isRequired: json['isRequired'] as bool,
    );
  }
}

// يطابق شكل استجابة محرك التشخيص في الـ backend (DiagnosticStepResponse):
// نوع واحد من ثلاثة (question/paywall/diagnosis) بحسب node_type للعقدة الحالية.
class DiagnosticStep {
  final DiagnosticStepType type;
  final String sessionId;
  final double confidenceScore;

  // question
  final String? questionText;
  final List<AnswerOption> answers;

  // paywall
  final String? message;

  // diagnosis
  final String? diagnosisTitle;
  final String? rootCause;
  final String? severityLevel;
  final List<DiagnosisPartInfo> parts;

  DiagnosticStep({
    required this.type,
    required this.sessionId,
    required this.confidenceScore,
    this.questionText,
    this.answers = const [],
    this.message,
    this.diagnosisTitle,
    this.rootCause,
    this.severityLevel,
    this.parts = const [],
  });

  factory DiagnosticStep.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String;
    return DiagnosticStep(
      type: DiagnosticStepType.values.firstWhere((t) => t.name == typeStr),
      sessionId: json['sessionId'] as String,
      confidenceScore: (json['confidenceScore'] as num).toDouble(),
      questionText: json['questionText'] as String?,
      answers: (json['answers'] as List<dynamic>?)
              ?.map((a) => AnswerOption.fromJson(a as Map<String, dynamic>))
              .toList() ??
          const [],
      message: json['message'] as String?,
      diagnosisTitle: json['diagnosisTitle'] as String?,
      rootCause: json['rootCause'] as String?,
      severityLevel: json['severityLevel'] as String?,
      parts: (json['parts'] as List<dynamic>?)
              ?.map((p) => DiagnosisPartInfo.fromJson(p as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}
