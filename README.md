# منصة "الفني الذكي" الشاملة (Smart Technician Platform)

منصة سحابية + تطبيق موبايل/ويب تعمل كـ "فني تبريد وتكييف وأفران ذكي شامل"، تشخّص أعطال
الأجهزة المنزلية والتجارية (ثلاجات، تكييف بجميع أنواعه، أفران) عبر أسئلة متسلسلة ذكية
(Decision Tree)، بدلاً من استدعاء فني بشري تقليدي.

هذا المستودع يُنفَّذ على مراحل متسلسلة وفق مواصفات المشروع الأصلية، بدءاً بإعداد الهيكلية
العامة قبل كتابة أي كود تفصيلي.

## حالة المراحل (Phases)

- [x] **Phase 1 — الأساسات (Setup)**: هيكل المشروع (Backend + Database + Frontend Skeleton)،
      مخطط قاعدة البيانات والـ Migrations، بيئة تطوير محلية عبر Docker Compose.
- [x] **Phase 2 — الفهرس الشامل للأجهزة والأعطال (Master Index / Seed Data)**: 10 أجهزة
      (4 تكييف، 3 ثلاجات، 3 أفران)، مقسّمة إلى أنظمة فرعية، مع قائمة أعراض أولية شائعة لكل جهاز.
- [x] **Phase 3 — محرك شجرة القرار (Diagnostic Engine)**: API لإدارة تسلسل الأسئلة، حساب
      "نسبة الثقة" التراكمي، وبوابة دفع (Paywall) تمنع كشف التشخيص الكامل قبل الدفع.
- [ ] Phase 4 — بوابة الدفع والنتيجة النهائية
- [ ] Phase 5 — لوحة التحكم الإدارية (Admin Panel)
- [ ] Phase 6 — تطبيق الموبايل (Flutter)

كل مرحلة تُبنى فقط بعد تأكيد إتمام السابقة.

## بنية المستودع

```
.
├── backend/        # NestJS (TypeScript) API + Prisma schema/migrations
├── admin-web/      # React + TypeScript — هيكل أولي للوحة التحكم الإدارية (Phase 5 لاحقاً)
└── docker-compose.yml
```

الفرونت إند للتطبيق (Flutter، Phase 6) وربط بوابة الدفع (HyperPay/Moyasar، Phase 4) لم يُبنيا بعد.

## التشغيل محلياً

### عبر Docker Compose (API + PostgreSQL + Redis)

```bash
docker compose up --build
```

يشغّل هذا Postgres على المنفذ 5432، Redis على 6379، وواجهة الـ API على 3000
(`GET /health` للتأكد من عمل الخدمة).

### تطوير الـ Backend مباشرة

```bash
cd backend
cp .env.example .env   # عدّل DATABASE_URL إذا لزم
npm install
npm run prisma:migrate  # ينشئ قاعدة البيانات ويطبّق مخطط prisma/schema.prisma
npm run db:seed         # يبني الفهرس الأولي (Phase 2) + شجرة تشخيص تجريبية للمكيف السبليت (Phase 3)
npm run start:dev
```

بعد التشغيل، `GET /catalog/appliances` يعرض الأجهزة لاختيار `applianceId`، ثم يمكن تجربة
محرك التشخيص كما في القسم التالي.

### تطوير لوحة الأدمن (هيكل أولي فقط)

```bash
cd admin-web
npm install
npm run dev
```

## مخطط قاعدة البيانات

معرّف بالكامل في `backend/prisma/schema.prisma` ويطابق التصميم في مواصفات المشروع:
`appliances`, `subsystems`, `symptoms`, `diagnostic_nodes`, `node_answers`, `diagnoses`,
`diagnosis_parts`, `parts`, `user_sessions`, `users`, `payments`. الحقول المرنة
(`metadata`, `compatible_models`, `answers_log`, `device_tokens`) من نوع JSONB لدعم
التوسع المستقبلي دون الحاجة لـ migration جديد لكل ميزة.

## بيانات البذر (Seed Data — Phase 2)

`backend/prisma/seed.ts` يبني الفهرس الأولي (`npm run db:seed`)، ويغطي:

- **تكييف**: سبليت، شباك، مركزي، كاسيت
- **ثلاجات**: عادية، نوفروست، سايد باي سايد
- **أفران**: كهربائي، غاز، بلت إن

لكل جهاز أنظمته الفرعية الخاصة به (دورة التبريد، الضاغط، النظام الكهربائي، نظام التحكم،
الفك الثلجي، نظام الغاز والإشعال... حسب نوع الجهاز) وقائمة أعراض ظاهرية أولية شائعة مرتبطة
بالنظام الفرعي المسبب لها. السكربت آمن للتشغيل المتكرر (idempotent) — لا يُنشئ سجلات مكررة.

## محرك شجرة القرار (Diagnostic Engine — Phase 3)

### واجهات القراءة (Phase 2 content)

- `GET /catalog/appliances` — قائمة الأجهزة.
- `GET /catalog/appliances/:id/symptoms` — الأعراض الشائعة لجهاز معيّن.

### جلسة التشخيص

- `POST /diagnostics/sessions` — بدء جلسة: `{ applianceId, symptomId?, userId? }`. تبحث عن
  عقدة الجذر (`parent_node_id IS NULL`) لهذا الجهاز وتُنشئ `user_session` جديدة.
- `GET /diagnostics/sessions/:id` — جلب حالة الجلسة الحالية (بلا اعتماد على ذاكرة السيرفر —
  كل شيء يُقرأ من قاعدة البيانات، بما يتوافق مع مبدأ Stateless backend).
- `POST /diagnostics/sessions/:id/answer` — إرسال إجابة: `{ nodeAnswerId }`. يحدّث العقدة
  الحالية، ويراكم `confidence_score` بإضافة `confidence_weight` الخاص بالعقدة التالية
  (بحد أقصى 100%).
- `POST /diagnostics/sessions/:id/simulate-payment` — ⚠️ **مؤقت لأغراض الاختبار المحلي
  فقط**، يُحاكي نجاح الدفع (`status='paid'` + سجل `payment`). سيُستبدل في Phase 4 بمعالج
  Webhook حقيقي من بوابة الدفع (HyperPay/Moyasar) بدل استدعاء العميل له مباشرة.

### شكل الاستجابة

كل استجابة من الجلسة نوع واحد من ثلاثة، بحسب `node_type` للعقدة الحالية:

- `question` — نص السؤال + خيارات الإجابة.
- `paywall` — رسالة تشويقية بنسبة الثقة الحالية و`requiresPayment: true`، **دون** كشف أي
  تفاصيل عن التشخيص. تُعاد هذه الاستجابة أيضاً لأي عقدة `diagnosis` تُطلب قبل الدفع (شبكة أمان).
- `diagnosis` — بعد الدفع فقط: عنوان التشخيص، السبب الجذري، مستوى الخطورة، وقطع الغيار
  المرتبطة (بما فيها رابط المتجر والسعر وحالة التوفر).

### الشجرة التجريبية المضمَّنة

`backend/prisma/seed.ts` يزرع شجرة قرار تجريبية كاملة لجهاز "مكيف سبليت" فقط (سؤالان
متفرّعان يؤديان إلى 5 نتائج تشخيص مختلفة عبر بوابتي دفع، مع 5 قطع غيار) لإثبات عمل
المحرك فعلياً. الشجرة الكاملة لبقية الأجهزة تُبنى لاحقاً عبر لوحة التحكم الإدارية
(Phase 5) بلا حاجة لتعديل هذا الكود — تماماً كما ينص مبدأ Content-driven, not code-driven.

## مبادئ تصميمية أساسية

- **Content-driven, not code-driven**: إضافة آلاف الأجهزة/الأعطال/الأسئلة تتم عبر البيانات
  (لاحقاً لوحة الأدمن)، دون تعديل الكود الأساسي.
- **Stateless backend**: حالة الجلسة (`user_sessions`) محفوظة بالكامل في قاعدة البيانات
  وليس في ذاكرة السيرفر، لدعم التوسع الأفقي دون Sticky Sessions.
- **أمان الدفع**: لا تُخزَّن بيانات الدفع مباشرة؛ التعامل يكون عبر توكنات بوابة الدفع فقط
  (PCI Compliance)، تُطبَّق عند بناء Phase 4.
