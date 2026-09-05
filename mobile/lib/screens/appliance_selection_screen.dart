import 'package:flutter/material.dart';
import '../models/appliance.dart';
import '../services/api_client.dart';
import 'symptom_selection_screen.dart';

class ApplianceSelectionScreen extends StatefulWidget {
  const ApplianceSelectionScreen({super.key});

  @override
  State<ApplianceSelectionScreen> createState() => _ApplianceSelectionScreenState();
}

class _ApplianceSelectionScreenState extends State<ApplianceSelectionScreen> {
  final _api = ApiClient();
  late Future<List<Appliance>> _appliancesFuture;

  @override
  void initState() {
    super.initState();
    _appliancesFuture = _api.getAppliances();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الفني الذكي')),
      body: FutureBuilder<List<Appliance>>(
        future: _appliancesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('تعذّر الاتصال بالخادم: ${snapshot.error}'));
          }
          final appliances = snapshot.data!;
          final byCategory = <String, List<Appliance>>{};
          for (final a in appliances) {
            byCategory.putIfAbsent(a.category, () => []).add(a);
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: Text(
                  'اختر نوع الجهاز الذي تواجه به مشكلة',
                  style: TextStyle(fontSize: 16, color: Colors.white70),
                ),
              ),
              for (final category in byCategory.keys) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(category, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                for (final appliance in byCategory[category]!)
                  Card(
                    child: ListTile(
                      title: Text(appliance.nameAr),
                      subtitle: Text(appliance.nameEn),
                      trailing: const Icon(Icons.chevron_left),
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => SymptomSelectionScreen(appliance: appliance),
                          ),
                        );
                      },
                    ),
                  ),
              ],
            ],
          );
        },
      ),
    );
  }
}
