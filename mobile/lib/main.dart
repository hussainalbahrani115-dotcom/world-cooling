import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/appliance_selection_screen.dart';
import 'theme.dart';

void main() {
  runApp(const SmartTechnicianApp());
}

class SmartTechnicianApp extends StatelessWidget {
  const SmartTechnicianApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'الفني الذكي',
      debugShowCheckedModeBanner: false,
      theme: appTheme,
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) {
        return Directionality(textDirection: TextDirection.rtl, child: child!);
      },
      home: const ApplianceSelectionScreen(),
    );
  }
}
