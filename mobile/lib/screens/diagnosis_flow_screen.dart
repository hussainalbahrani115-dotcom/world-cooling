import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/appliance.dart';
import '../models/diagnostic_step.dart';
import '../services/api_client.dart';
import '../widgets/confidence_bar.dart';

class DiagnosisFlowScreen extends StatefulWidget {
  final Appliance appliance;
  final String? symptomId;
  const DiagnosisFlowScreen({super.key, required this.appliance, this.symptomId});

  @override
  State<DiagnosisFlowScreen> createState() => _DiagnosisFlowScreenState();
}

class _DiagnosisFlowScreenState extends State<DiagnosisFlowScreen> {
  final _api = ApiClient();
  DiagnosticStep? _step;
  String? _error;
  bool _busy = true;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final step = await _api.startSession(
        applianceId: widget.appliance.id,
        symptomId: widget.symptomId,
      );
      setState(() => _step = step);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _answer(String nodeAnswerId) async {
    final step = _step;
    if (step == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final next = await _api.submitAnswer(sessionId: step.sessionId, nodeAnswerId: nodeAnswerId);
      setState(() => _step = next);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _pay() async {
    final step = _step;
    if (step == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final next = await _api.simulatePayment(step.sessionId);
      setState(() => _step = next);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.appliance.nameAr)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_busy && _step == null) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.redAccent)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _start, child: const Text('إعادة المحاولة')),
          ],
        ),
      );
    }

    final step = _step!;
    switch (step.type) {
      case DiagnosticStepType.question:
        return _QuestionView(step: step, busy: _busy, onAnswer: _answer);
      case DiagnosticStepType.paywall:
        return _PaywallView(step: step, busy: _busy, onPay: _pay);
      case DiagnosticStepType.diagnosis:
        return _DiagnosisResultView(step: step);
    }
  }
}

class _QuestionView extends StatelessWidget {
  final DiagnosticStep step;
  final bool busy;
  final ValueChanged<String> onAnswer;
  const _QuestionView({required this.step, required this.busy, required this.onAnswer});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ConfidenceBar(confidenceScore: step.confidenceScore),
        const SizedBox(height: 24),
        Text(step.questionText ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        Expanded(
          child: ListView(
            children: [
              for (final answer in step.answers)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: OutlinedButton(
                    onPressed: busy ? null : () => onAnswer(answer.id),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                      alignment: Alignment.centerRight,
                    ),
                    child: Row(
                      children: [
                        Expanded(child: Text(answer.answerText, textAlign: TextAlign.right)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
        if (busy) const Center(child: CircularProgressIndicator()),
      ],
    );
  }
}

class _PaywallView extends StatelessWidget {
  final DiagnosticStep step;
  final bool busy;
  final VoidCallback onPay;
  const _PaywallView({required this.step, required this.busy, required this.onPay});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ConfidenceBar(confidenceScore: step.confidenceScore),
        const SizedBox(height: 32),
        const Icon(Icons.lock_outline, size: 56, color: Color(0xFFF0883E)),
        const SizedBox(height: 16),
        Text(
          step.message ?? '',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 17),
        ),
        const SizedBox(height: 28),
        ElevatedButton(
          onPressed: busy ? null : onPay,
          child: busy
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('الدفع الآن (20 ريال سعودي)'),
        ),
        const SizedBox(height: 8),
        // ⚠️ يستدعي endpoint اختباري مؤقت (simulate-payment) إلى حين ربط بوابة دفع حقيقية
        // (HyperPay/Moyasar) في Phase 4 — لا تُجرى أي عملية دفع فعلية حالياً.
        const Text('وضع تجريبي: لا تُخصم أي مبالغ فعلية حالياً', style: TextStyle(color: Colors.white38, fontSize: 12)),
      ],
    );
  }
}

class _DiagnosisResultView extends StatelessWidget {
  final DiagnosticStep step;
  const _DiagnosisResultView({required this.step});

  Color _severityColor(String level) {
    switch (level) {
      case 'حرج':
        return Colors.redAccent;
      case 'عالٍ':
        return Colors.orangeAccent;
      case 'متوسط':
        return Colors.amber;
      default:
        return Colors.greenAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.greenAccent),
            const SizedBox(width: 8),
            const Text('التشخيص الكامل', style: TextStyle(fontSize: 14, color: Colors.white70)),
          ],
        ),
        const SizedBox(height: 12),
        Text(step.diagnosisTitle ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Chip(
          label: Text('مستوى الخطورة: ${step.severityLevel ?? ''}'),
          backgroundColor: _severityColor(step.severityLevel ?? '').withValues(alpha: 0.2),
        ),
        const SizedBox(height: 16),
        const Text('السبب الجذري', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white70)),
        const SizedBox(height: 6),
        Text(step.rootCause ?? ''),
        const SizedBox(height: 24),
        const Text('قطع الغيار المطلوبة', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white70)),
        const SizedBox(height: 8),
        for (final part in step.parts)
          Card(
            child: ListTile(
              title: Text(part.name),
              subtitle: Text('${part.sku} · ${part.price} ريال · ${part.isRequired ? "مطلوبة" : "اختيارية"}'),
              trailing: FilledButton(
                onPressed: () => launchUrl(Uri.parse(part.storeUrl), mode: LaunchMode.externalApplication),
                child: const Text('شراء'),
              ),
            ),
          ),
      ],
    );
  }
}
