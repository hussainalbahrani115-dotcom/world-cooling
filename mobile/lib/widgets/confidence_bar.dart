import 'package:flutter/material.dart';

// شريط تقدّم "نسبة الثقة" — يُحدَّث بعد كل إجابة، كما هو موصوف في مسار المستخدم بالمواصفات.
class ConfidenceBar extends StatelessWidget {
  final double confidenceScore;
  const ConfidenceBar({super.key, required this.confidenceScore});

  @override
  Widget build(BuildContext context) {
    final percent = (confidenceScore.clamp(0, 1) * 100).round();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('نسبة الثقة في التشخيص', style: TextStyle(color: Colors.white70, fontSize: 13)),
            Text('$percent%', style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: confidenceScore.clamp(0, 1),
            minHeight: 10,
            backgroundColor: const Color(0xFF21262D),
          ),
        ),
      ],
    );
  }
}
