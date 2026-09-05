// عنوان الـ backend. القيمة الافتراضية (10.0.2.2) هي عنوان جهاز التطوير المضيف كما
// يراه محاكي أندرويد (Android emulator) — وليست صالحة لمحاكي iOS (استخدم localhost)
// أو لجهاز فعلي (استخدم عنوان IP الفعلي لجهازك على نفس الشبكة). مرّرها عند التشغيل:
//   flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000',
);
