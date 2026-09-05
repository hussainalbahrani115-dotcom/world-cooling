import 'package:flutter/material.dart';

// نفس هوية الألوان الداكنة المستخدمة في admin-web (أزرق #1f6feb، برتقالي #f0883e على
// خلفية شبه سوداء) للحفاظ على مظهر موحّد عبر مكوّنات المشروع.
final ThemeData appTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  scaffoldBackgroundColor: const Color(0xFF0B0F14),
  colorScheme: const ColorScheme.dark(
    primary: Color(0xFF1F6FEB),
    secondary: Color(0xFFF0883E),
    surface: Color(0xFF161B22),
    error: Color(0xFFDA3633),
  ),
  cardTheme: const CardThemeData(
    color: Color(0xFF161B22),
    margin: EdgeInsets.symmetric(vertical: 8),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: Color(0xFF0D1117),
    foregroundColor: Colors.white,
    centerTitle: true,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF1F6FEB),
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
  ),
  progressIndicatorTheme: const ProgressIndicatorThemeData(
    color: Color(0xFFF0883E),
  ),
);
