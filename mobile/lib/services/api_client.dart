import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/appliance.dart';
import '../models/diagnostic_step.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);

  @override
  String toString() => message;
}

// عميل بسيط لواجهات /catalog و/diagnostics العامة (لا يحتاج ترويسة x-admin-token —
// تلك خاصة بلوحة التحكم فقط، راجع backend/src/admin).
class ApiClient {
  final String baseUrl;
  ApiClient({this.baseUrl = apiBaseUrl});

  Future<List<Appliance>> getAppliances() async {
    final body = await _get('/catalog/appliances');
    return (body as List<dynamic>)
        .map((json) => Appliance.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<List<Symptom>> getSymptoms(String applianceId) async {
    final body = await _get('/catalog/appliances/$applianceId/symptoms');
    return (body as List<dynamic>)
        .map((json) => Symptom.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<DiagnosticStep> startSession({
    required String applianceId,
    String? symptomId,
  }) async {
    final body = await _post('/diagnostics/sessions', {
      'applianceId': applianceId,
      'symptomId': ?symptomId,
    });
    return DiagnosticStep.fromJson(body as Map<String, dynamic>);
  }

  Future<DiagnosticStep> getSession(String sessionId) async {
    final body = await _get('/diagnostics/sessions/$sessionId');
    return DiagnosticStep.fromJson(body as Map<String, dynamic>);
  }

  Future<DiagnosticStep> submitAnswer({
    required String sessionId,
    required String nodeAnswerId,
  }) async {
    final body = await _post('/diagnostics/sessions/$sessionId/answer', {
      'nodeAnswerId': nodeAnswerId,
    });
    return DiagnosticStep.fromJson(body as Map<String, dynamic>);
  }

  // ⚠️ يستدعي نقطة النهاية المؤقتة simulate-payment (راجع backend/src/diagnostics) —
  // ستُستبدل بتدفق دفع حقيقي عبر HyperPay/Moyasar في Phase 4 عند الاقتراب من الإطلاق.
  Future<DiagnosticStep> simulatePayment(String sessionId) async {
    final body = await _post('/diagnostics/sessions/$sessionId/simulate-payment', {});
    return DiagnosticStep.fromJson(body as Map<String, dynamic>);
  }

  Future<dynamic> _get(String path) async {
    final response = await http.get(Uri.parse('$baseUrl$path'));
    return _handle(response);
  }

  Future<dynamic> _post(String path, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return _handle(response);
  }

  dynamic _handle(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      String message = 'خطأ غير متوقع (${response.statusCode})';
      try {
        final decoded = jsonDecode(response.body);
        final rawMessage = decoded['message'];
        message = rawMessage is List ? rawMessage.join('، ') : (rawMessage?.toString() ?? message);
      } catch (_) {
        // الاستجابة ليست JSON صالحاً
      }
      throw ApiException(message, response.statusCode);
    }
    if (response.body.isEmpty) return null;
    return jsonDecode(response.body);
  }
}
