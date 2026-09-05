import 'package:flutter_test/flutter_test.dart';

import 'package:smart_technician_app/main.dart';

void main() {
  testWidgets('Home screen renders with its app bar title', (tester) async {
    await tester.pumpWidget(const SmartTechnicianApp());
    // flutter_test intercepts HttpClient and fails requests immediately, so the
    // appliances fetch settles (into an error state) within the first pump —
    // we only assert the chrome that renders regardless of that fetch's outcome.
    await tester.pump();

    expect(find.text('الفني الذكي'), findsWidgets);
  });
}
