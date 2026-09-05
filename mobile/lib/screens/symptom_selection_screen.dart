import 'package:flutter/material.dart';
import '../models/appliance.dart';
import '../services/api_client.dart';
import 'diagnosis_flow_screen.dart';

class SymptomSelectionScreen extends StatefulWidget {
  final Appliance appliance;
  const SymptomSelectionScreen({super.key, required this.appliance});

  @override
  State<SymptomSelectionScreen> createState() => _SymptomSelectionScreenState();
}

class _SymptomSelectionScreenState extends State<SymptomSelectionScreen> {
  final _api = ApiClient();
  late Future<List<Symptom>> _symptomsFuture;

  @override
  void initState() {
    super.initState();
    _symptomsFuture = _api.getSymptoms(widget.appliance.id);
  }

  void _startDiagnosis({String? symptomId}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => DiagnosisFlowScreen(appliance: widget.appliance, symptomId: symptomId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.appliance.nameAr)),
      body: FutureBuilder<List<Symptom>>(
        future: _symptomsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('تعذّر تحميل الأعراض: ${snapshot.error}'));
          }
          final symptoms = snapshot.data!;

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Text(
                        'اختر العرض الأقرب لمشكلتك (اختياري)',
                        style: TextStyle(fontSize: 16, color: Colors.white70),
                      ),
                    ),
                    for (final symptom in symptoms)
                      Card(
                        child: ListTile(
                          title: Text(symptom.title),
                          subtitle: symptom.description != null ? Text(symptom.description!) : null,
                          trailing: const Icon(Icons.chevron_left),
                          onTap: () => _startDiagnosis(symptomId: symptom.id),
                        ),
                      ),
                    if (symptoms.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('لا توجد أعراض شائعة مسجّلة لهذا الجهاز بعد.', style: TextStyle(color: Colors.white54)),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => _startDiagnosis(),
                    child: const Text('لا يوجد عرض مطابق — ابدأ التشخيص مباشرة'),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
