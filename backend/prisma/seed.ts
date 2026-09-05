// Smart Technician Platform — seed data (Phase 2: Master Index)
// يبني الفهرس الشامل الأولي: تصنيفات الأجهزة، أنظمتها الفرعية، وأعراضها الظاهرية الشائعة.
// هذه بيانات (Content-driven) فقط — لا منطق تشخيص هنا؛ محرك شجرة القرار يُبنى في Phase 3.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubsystemSeed {
  key: string;
  nameAr: string;
  nameEn: string;
}

interface SymptomSeed {
  title: string;
  description?: string;
  subsystemKey?: string;
}

interface ApplianceSeed {
  nameAr: string;
  nameEn: string;
  category: 'تكييف' | 'ثلاجات' | 'أفران';
  subsystems: SubsystemSeed[];
  symptoms: SymptomSeed[];
}

const appliances: ApplianceSeed[] = [
  // ===================== تكييف =====================
  {
    nameAr: 'مكيف سبليت',
    nameEn: 'Split AC',
    category: 'تكييف',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'control', nameAr: 'نظام التحكم والريموت', nameEn: 'Control & Remote System' },
      { key: 'fan_motor', nameAr: 'المروحة والموتور', nameEn: 'Fan & Motor' },
      { key: 'drainage', nameAr: 'نظام التصريف', nameEn: 'Drainage System' },
    ],
    symptoms: [
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
      { title: 'تبريد ضعيف', subsystemKey: 'cooling_cycle' },
      { title: 'تسريب مياه من الوحدة الداخلية', subsystemKey: 'drainage' },
      { title: 'المكيف لا يعمل نهائياً (لا كهرباء)', subsystemKey: 'electrical' },
      { title: 'صوت غير طبيعي من الوحدة الخارجية', subsystemKey: 'fan_motor' },
      { title: 'الريموت لا يستجيب', subsystemKey: 'control' },
      { title: 'تجمد الثلج على الوحدة الداخلية', subsystemKey: 'cooling_cycle' },
      { title: 'توقف المكيف تلقائياً بعد فترة قصيرة من التشغيل', subsystemKey: 'electrical' },
      { title: 'رائحة كريهة عند التشغيل', subsystemKey: 'cooling_cycle' },
      { title: 'خروج هواء ساخن بدلاً من بارد', subsystemKey: 'compressor' },
    ],
  },
  {
    nameAr: 'مكيف شباك',
    nameEn: 'Window AC',
    category: 'تكييف',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'control', nameAr: 'نظام التحكم', nameEn: 'Control System' },
      { key: 'fan_motor', nameAr: 'المروحة والموتور', nameEn: 'Fan & Motor' },
      { key: 'drainage', nameAr: 'نظام التصريف', nameEn: 'Drainage System' },
    ],
    symptoms: [
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
      { title: 'تبريد ضعيف', subsystemKey: 'cooling_cycle' },
      { title: 'اهتزاز وصوت عالٍ غير طبيعي', subsystemKey: 'fan_motor' },
      { title: 'تسريب مياه داخل الغرفة', subsystemKey: 'drainage' },
      { title: 'المكيف لا يعمل نهائياً (لا كهرباء)', subsystemKey: 'electrical' },
      { title: 'أزرار التحكم لا تستجيب', subsystemKey: 'control' },
      { title: 'تجمد الثلج على المبخر', subsystemKey: 'cooling_cycle' },
      { title: 'توقف مفاجئ أثناء التشغيل', subsystemKey: 'electrical' },
    ],
  },
  {
    nameAr: 'مكيف مركزي',
    nameEn: 'Central AC',
    category: 'تكييف',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'control', nameAr: 'نظام التحكم المركزي (ثرموستات/مناطق)', nameEn: 'Central Control (Thermostat/Zoning)' },
      { key: 'ductwork', nameAr: 'نظام الدكت والمراوح', nameEn: 'Ductwork & Blowers' },
      { key: 'drainage', nameAr: 'نظام التصريف', nameEn: 'Drainage System' },
    ],
    symptoms: [
      { title: 'تفاوت في التبريد بين الغرف', subsystemKey: 'ductwork' },
      { title: 'ضعف سريان الهواء من المخارج', subsystemKey: 'ductwork' },
      { title: 'صوت غير طبيعي من غرفة المكينة', subsystemKey: 'compressor' },
      { title: 'تسريب مياه من وحدة الدكت', subsystemKey: 'drainage' },
      { title: 'توقف الوحدة عن العمل نهائياً', subsystemKey: 'electrical' },
      { title: 'رائحة عفن من فتحات التكييف', subsystemKey: 'ductwork' },
      { title: 'الثرموستات لا يستجيب', subsystemKey: 'control' },
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
    ],
  },
  {
    nameAr: 'مكيف كاسيت',
    nameEn: 'Cassette AC',
    category: 'تكييف',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'control', nameAr: 'نظام التحكم والريموت', nameEn: 'Control & Remote System' },
      { key: 'fan_motor', nameAr: 'المروحة والموتور', nameEn: 'Fan & Motor' },
      { key: 'drain_pump', nameAr: 'نظام التصريف ومضخة الصرف', nameEn: 'Drainage & Drain Pump' },
    ],
    symptoms: [
      { title: 'تسريب مياه من السقف', subsystemKey: 'drain_pump' },
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
      { title: 'تبريد ضعيف', subsystemKey: 'cooling_cycle' },
      { title: 'صوت غير طبيعي أثناء التشغيل', subsystemKey: 'fan_motor' },
      { title: 'الريموت لا يستجيب', subsystemKey: 'control' },
      { title: 'توقف مفاجئ أثناء العمل', subsystemKey: 'electrical' },
      { title: 'تجمد الثلج على الوحدة', subsystemKey: 'cooling_cycle' },
    ],
  },

  // ===================== ثلاجات =====================
  {
    nameAr: 'ثلاجة عادية',
    nameEn: 'Regular Fridge',
    category: 'ثلاجات',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'thermostat', nameAr: 'نظام التحكم والثرموستات', nameEn: 'Control & Thermostat System' },
      { key: 'insulation', nameAr: 'العزل والأبواب', nameEn: 'Insulation & Doors' },
    ],
    symptoms: [
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
      { title: 'تبريد ضعيف/غير كافٍ', subsystemKey: 'cooling_cycle' },
      { title: 'تكوّن ثلج زائد داخل الفريزر', subsystemKey: 'cooling_cycle' },
      { title: 'تسريب مياه أسفل الثلاجة', subsystemKey: 'insulation' },
      { title: 'صوت غير طبيعي أو ضوضاء عالية', subsystemKey: 'compressor' },
      { title: 'الإضاءة الداخلية لا تعمل', subsystemKey: 'electrical' },
      { title: 'الباب لا يغلق بإحكام', subsystemKey: 'insulation' },
      { title: 'رائحة كريهة داخل الثلاجة', subsystemKey: 'insulation' },
      { title: 'الثلاجة لا تعمل نهائياً (لا كهرباء)', subsystemKey: 'electrical' },
      { title: 'الضاغط يعمل بشكل متواصل دون توقف', subsystemKey: 'compressor' },
    ],
  },
  {
    nameAr: 'ثلاجة نوفروست',
    nameEn: 'No-Frost Fridge',
    category: 'ثلاجات',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'thermostat', nameAr: 'نظام التحكم والثرموستات', nameEn: 'Control & Thermostat System' },
      { key: 'defrost', nameAr: 'نظام الفك الثلجي (Defrost)', nameEn: 'Defrost System' },
      { key: 'insulation', nameAr: 'العزل والأبواب', nameEn: 'Insulation & Doors' },
    ],
    symptoms: [
      { title: 'تكوّن ثلج زائد رغم وجود نظام النوفروست', subsystemKey: 'defrost' },
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
      { title: 'تبريد ضعيف', subsystemKey: 'cooling_cycle' },
      { title: 'تسريب مياه أسفل الثلاجة', subsystemKey: 'defrost' },
      { title: 'صوت غير طبيعي', subsystemKey: 'compressor' },
      { title: 'الإضاءة الداخلية لا تعمل', subsystemKey: 'electrical' },
      { title: 'الباب لا يغلق بإحكام', subsystemKey: 'insulation' },
      { title: 'رائحة كريهة داخل الثلاجة', subsystemKey: 'insulation' },
      { title: 'مروحة الفريزر متجمدة ولا تعمل', subsystemKey: 'defrost' },
    ],
  },
  {
    nameAr: 'ثلاجة سايد باي سايد',
    nameEn: 'Side-by-Side Fridge',
    category: 'ثلاجات',
    subsystems: [
      { key: 'cooling_cycle', nameAr: 'دورة التبريد', nameEn: 'Refrigeration Cycle' },
      { key: 'compressor', nameAr: 'الضاغط', nameEn: 'Compressor' },
      { key: 'electrical', nameAr: 'النظام الكهربائي', nameEn: 'Electrical System' },
      { key: 'thermostat', nameAr: 'نظام التحكم والثرموستات', nameEn: 'Control & Thermostat System' },
      { key: 'defrost', nameAr: 'نظام الفك الثلجي (Defrost)', nameEn: 'Defrost System' },
      { key: 'ice_water', nameAr: 'نظام صانعة الثلج وموزع الماء', nameEn: 'Ice Maker & Water Dispenser' },
      { key: 'insulation', nameAr: 'العزل والأبواب', nameEn: 'Insulation & Doors' },
    ],
    symptoms: [
      { title: 'موزع الماء لا يعمل', subsystemKey: 'ice_water' },
      { title: 'صانعة الثلج لا تنتج ثلج', subsystemKey: 'ice_water' },
      { title: 'لا يبرد نهائياً', subsystemKey: 'cooling_cycle' },
      { title: 'تبريد ضعيف في أحد الجانبين فقط', subsystemKey: 'cooling_cycle' },
      { title: 'تسريب مياه', subsystemKey: 'defrost' },
      { title: 'صوت غير طبيعي', subsystemKey: 'compressor' },
      { title: 'الباب لا يغلق بإحكام', subsystemKey: 'insulation' },
      { title: 'رائحة كريهة داخل الثلاجة', subsystemKey: 'insulation' },
      { title: 'تجمد زائد داخل الفريزر', subsystemKey: 'defrost' },
    ],
  },

  // ===================== أفران =====================
  {
    nameAr: 'فرن كهربائي',
    nameEn: 'Electric Oven',
    category: 'أفران',
    subsystems: [
      { key: 'heating', nameAr: 'نظام التسخين (عناصر التسخين)', nameEn: 'Heating System (Elements)' },
      { key: 'electrical', nameAr: 'النظام الكهربائي والتحكم', nameEn: 'Electrical & Control System' },
      { key: 'thermostat', nameAr: 'الثرموستات وحساس الحرارة', nameEn: 'Thermostat & Temperature Sensor' },
      { key: 'door', nameAr: 'الباب والعزل', nameEn: 'Door & Insulation' },
      { key: 'fan', nameAr: 'المروحة (الحمل الحراري)', nameEn: 'Fan (Convection)' },
    ],
    symptoms: [
      { title: 'الفرن لا يسخن نهائياً', subsystemKey: 'heating' },
      { title: 'تسخين غير متساوٍ', subsystemKey: 'thermostat' },
      { title: 'عنصر التسخين لا يحمّر (لا يضيء)', subsystemKey: 'heating' },
      { title: 'لوحة التحكم لا تستجيب', subsystemKey: 'electrical' },
      { title: 'الباب لا يغلق بإحكام', subsystemKey: 'door' },
      { title: 'الإضاءة الداخلية لا تعمل', subsystemKey: 'electrical' },
      { title: 'صوت غير طبيعي من المروحة', subsystemKey: 'fan' },
      { title: 'المؤقت لا يعمل', subsystemKey: 'electrical' },
      { title: 'قاطع الكهرباء يفصل عند التشغيل', subsystemKey: 'electrical' },
    ],
  },
  {
    nameAr: 'فرن غاز',
    nameEn: 'Gas Oven',
    category: 'أفران',
    subsystems: [
      { key: 'gas_ignition', nameAr: 'نظام الغاز والإشعال', nameEn: 'Gas & Ignition System' },
      { key: 'electrical', nameAr: 'النظام الكهربائي والتحكم', nameEn: 'Electrical & Control System' },
      { key: 'thermostat', nameAr: 'الثرموستات وحساس الحرارة', nameEn: 'Thermostat & Temperature Sensor' },
      { key: 'door', nameAr: 'الباب والعزل', nameEn: 'Door & Insulation' },
    ],
    symptoms: [
      { title: 'الفرن لا يشتعل نهائياً', subsystemKey: 'gas_ignition' },
      { title: 'رائحة غاز عند التشغيل', subsystemKey: 'gas_ignition' },
      { title: 'شرارة عند الإشعال لكن لا يشتعل', subsystemKey: 'gas_ignition' },
      { title: 'تسخين غير متساوٍ', subsystemKey: 'thermostat' },
      { title: 'اللهب غير منتظم أو ضعيف', subsystemKey: 'gas_ignition' },
      { title: 'الباب لا يغلق بإحكام', subsystemKey: 'door' },
      { title: 'لوحة التحكم لا تستجيب', subsystemKey: 'electrical' },
      { title: 'انطفاء الفرن تلقائياً أثناء العمل', subsystemKey: 'gas_ignition' },
    ],
  },
  {
    nameAr: 'فرن بلت إن',
    nameEn: 'Built-in Oven',
    category: 'أفران',
    subsystems: [
      { key: 'heating', nameAr: 'نظام التسخين', nameEn: 'Heating System' },
      { key: 'electrical', nameAr: 'النظام الكهربائي والتحكم', nameEn: 'Electrical & Control System' },
      { key: 'thermostat', nameAr: 'الثرموستات وحساس الحرارة', nameEn: 'Thermostat & Temperature Sensor' },
      { key: 'convection', nameAr: 'نظام الحمل الحراري (مروحة)', nameEn: 'Convection Fan System' },
      { key: 'door', nameAr: 'الباب والعزل', nameEn: 'Door & Insulation' },
    ],
    symptoms: [
      { title: 'الفرن لا يسخن نهائياً', subsystemKey: 'heating' },
      { title: 'تسخين غير متساوٍ', subsystemKey: 'thermostat' },
      { title: 'مروحة الحمل الحراري لا تعمل', subsystemKey: 'convection' },
      { title: 'لوحة التحكم اللمسية لا تستجيب', subsystemKey: 'electrical' },
      { title: 'الباب لا يغلق بإحكام', subsystemKey: 'door' },
      { title: 'رمز خطأ يظهر على الشاشة', subsystemKey: 'electrical' },
      { title: 'الإضاءة الداخلية لا تعمل', subsystemKey: 'electrical' },
      { title: 'صوت غير طبيعي أثناء التشغيل', subsystemKey: 'convection' },
    ],
  },
];

async function seedApplianceMasterIndex() {
  for (const appliance of appliances) {
    // findFirst + create بدلاً من upsert لأن name_en ليس حقلاً فريداً في المخطط —
    // هذا يضمن أن تشغيل السكربت أكثر من مرة (idempotent) لا يُنشئ سجلات مكررة.
    let createdAppliance = await prisma.appliance.findFirst({
      where: { nameEn: appliance.nameEn },
    });
    if (!createdAppliance) {
      createdAppliance = await prisma.appliance.create({
        data: {
          nameAr: appliance.nameAr,
          nameEn: appliance.nameEn,
          category: appliance.category,
        },
      });
    }

    const subsystemIdByKey = new Map<string, string>();
    for (const subsystem of appliance.subsystems) {
      let record = await prisma.subsystem.findFirst({
        where: { applianceId: createdAppliance.id, nameEn: subsystem.nameEn },
      });
      if (!record) {
        record = await prisma.subsystem.create({
          data: {
            applianceId: createdAppliance.id,
            nameAr: subsystem.nameAr,
            nameEn: subsystem.nameEn,
          },
        });
      }
      subsystemIdByKey.set(subsystem.key, record.id);
    }

    for (const symptom of appliance.symptoms) {
      const existing = await prisma.symptom.findFirst({
        where: { applianceId: createdAppliance.id, title: symptom.title },
      });
      if (existing) continue;
      await prisma.symptom.create({
        data: {
          applianceId: createdAppliance.id,
          subsystemId: symptom.subsystemKey ? subsystemIdByKey.get(symptom.subsystemKey) : undefined,
          title: symptom.title,
          description: symptom.description,
        },
      });
    }

    console.log(`✓ ${appliance.nameAr} (${appliance.nameEn}): ${appliance.subsystems.length} أنظمة فرعية، ${appliance.symptoms.length} أعراض`);
  }
}

// ============================================================================
// Phase 3 — بيانات تجريبية لشجرة قرار كاملة (مكيف سبليت) لاختبار محرك التشخيص.
// هذه شجرة توضيحية صغيرة فقط لإثبات عمل المحرك (أسئلة متسلسلة، حساب نسبة الثقة،
// بوابة الدفع، ثم عرض التشخيص وقطع الغيار). الشجرة الكاملة الفعلية لكل الأجهزة
// تُبنى لاحقاً عبر لوحة التحكم الإدارية (Phase 5)، وليست جزءاً من الكود الأساسي.
// ============================================================================

interface PartSeed {
  key: string;
  name: string;
  sku: string;
  price: number;
  storeUrl: string;
  stockStatus: string;
}

const parts: PartSeed[] = [
  { key: 'filter', name: 'فلتر هواء داخلي', sku: 'SPLIT-FILT-001', price: 45, storeUrl: 'https://store.example.com/parts/SPLIT-FILT-001', stockStatus: 'available' },
  { key: 'gas', name: 'تعبئة غاز تبريد R410A', sku: 'SPLIT-GAS-001', price: 150, storeUrl: 'https://store.example.com/parts/SPLIT-GAS-001', stockStatus: 'available' },
  { key: 'pcb', name: 'لوحة تحكم رئيسية (PCB)', sku: 'SPLIT-PCB-001', price: 320, storeUrl: 'https://store.example.com/parts/SPLIT-PCB-001', stockStatus: 'available' },
  { key: 'capacitor', name: 'مكثف تشغيل (كباستور) للضاغط', sku: 'SPLIT-CAP-001', price: 60, storeUrl: 'https://store.example.com/parts/SPLIT-CAP-001', stockStatus: 'available' },
  { key: 'compressor', name: 'ضاغط (كمبروسر) بديل', sku: 'SPLIT-COMP-001', price: 950, storeUrl: 'https://store.example.com/parts/SPLIT-COMP-001', stockStatus: 'low_stock' },
];

interface DiagnosisSeed {
  title: string;
  rootCause: string;
  severityLevel: string;
  partKeys: { key: string; isRequired: boolean }[];
}

interface DemoNodeSeed {
  key: string;
  nodeType: 'question' | 'diagnosis' | 'paywall';
  parentKey: string | null;
  subsystemKey?: string;
  questionText?: string;
  confidenceWeight: number;
  diagnosis?: DiagnosisSeed;
  // للأسئلة: قائمة الإجابات وعقدة الوجهة التالية لكل منها
  answers?: { answerText: string; nextKey: string }[];
}

const demoNodes: DemoNodeSeed[] = [
  {
    key: 'n1_power',
    nodeType: 'question',
    parentKey: null,
    questionText: 'هل يعمل المكيف عند الضغط على زر التشغيل؟',
    confidenceWeight: 0,
    answers: [
      { answerText: 'نعم، يعمل لكن لا يبرد بالشكل المطلوب', nextKey: 'n2_ice' },
      { answerText: 'لا، لا يستجيب نهائياً عند التشغيل', nextKey: 'n3_breaker' },
    ],
  },
  {
    key: 'n2_ice',
    nodeType: 'question',
    parentKey: 'n1_power',
    subsystemKey: 'cooling_cycle',
    questionText: 'هل تلاحظ تجمد ثلج واضح على الوحدة الداخلية أو الأنابيب؟',
    confidenceWeight: 0.35,
    answers: [
      { answerText: 'نعم، أرى تجمد ثلج واضح', nextKey: 'pw_ice' },
      { answerText: 'لا يوجد تجمد ثلج', nextKey: 'n5_compressor_sound' },
    ],
  },
  {
    key: 'n3_breaker',
    nodeType: 'question',
    parentKey: 'n1_power',
    subsystemKey: 'electrical',
    questionText: 'هل تحققت من القاطع الكهربائي (البريكر) الخاص بالمكيف؟',
    confidenceWeight: 0.35,
    answers: [
      { answerText: 'القاطع مفصول أو ساقط', nextKey: 'pw_breaker_tripped' },
      { answerText: 'القاطع سليم ولم يفصل', nextKey: 'pw_no_response' },
    ],
  },
  {
    key: 'n5_compressor_sound',
    nodeType: 'question',
    parentKey: 'n2_ice',
    subsystemKey: 'cooling_cycle',
    questionText: 'هل صوت الضاغط في الوحدة الخارجية يعمل بشكل طبيعي؟',
    confidenceWeight: 0.2,
    answers: [
      { answerText: 'نعم، لكن التبريد ضعيف', nextKey: 'pw_weak_cooling' },
      { answerText: 'لا أسمع صوت الضاغط إطلاقاً', nextKey: 'pw_compressor_dead' },
    ],
  },
  {
    key: 'pw_ice',
    nodeType: 'paywall',
    parentKey: 'n2_ice',
    confidenceWeight: 0.5,
    answers: [{ answerText: 'عرض التشخيص الكامل', nextKey: 'diag_ice' }],
  },
  {
    key: 'pw_breaker_tripped',
    nodeType: 'paywall',
    parentKey: 'n3_breaker',
    confidenceWeight: 0.5,
    answers: [{ answerText: 'عرض التشخيص الكامل', nextKey: 'diag_breaker_tripped' }],
  },
  {
    key: 'pw_no_response',
    nodeType: 'paywall',
    parentKey: 'n3_breaker',
    confidenceWeight: 0.5,
    answers: [{ answerText: 'عرض التشخيص الكامل', nextKey: 'diag_no_response' }],
  },
  {
    key: 'pw_weak_cooling',
    nodeType: 'paywall',
    parentKey: 'n5_compressor_sound',
    confidenceWeight: 0.45,
    answers: [{ answerText: 'عرض التشخيص الكامل', nextKey: 'diag_weak_cooling' }],
  },
  {
    key: 'pw_compressor_dead',
    nodeType: 'paywall',
    parentKey: 'n5_compressor_sound',
    confidenceWeight: 0.45,
    answers: [{ answerText: 'عرض التشخيص الكامل', nextKey: 'diag_compressor_dead' }],
  },
  {
    key: 'diag_ice',
    nodeType: 'diagnosis',
    parentKey: 'pw_ice',
    confidenceWeight: 0,
    diagnosis: {
      title: 'تجمد الثلج على الوحدة الداخلية — نقص غاز التبريد أو انسداد الفلتر',
      rootCause: 'نقص في غاز التبريد (فريون) بسبب تسريب في الدائرة، أو انسداد فلتر الهواء يعيق دورة التبريد الطبيعية فيتجمد المبخر.',
      severityLevel: 'متوسط',
      partKeys: [
        { key: 'filter', isRequired: false },
        { key: 'gas', isRequired: true },
      ],
    },
  },
  {
    key: 'diag_breaker_tripped',
    nodeType: 'diagnosis',
    parentKey: 'pw_breaker_tripped',
    confidenceWeight: 0,
    diagnosis: {
      title: 'القاطع الكهربائي يفصل بشكل متكرر — تماس كهربائي محتمل',
      rootCause: 'تماس كهربائي في لوحة التحكم أو ملف الموتور يسبب سحب تيار زائد يؤدي لفصل القاطع تلقائياً لحماية الدائرة.',
      severityLevel: 'عالٍ',
      partKeys: [{ key: 'pcb', isRequired: true }],
    },
  },
  {
    key: 'diag_no_response',
    nodeType: 'diagnosis',
    parentKey: 'pw_no_response',
    confidenceWeight: 0,
    diagnosis: {
      title: 'لا توجد استجابة رغم سلامة القاطع — عطل في لوحة التحكم أو مصدر التغذية',
      rootCause: 'تلف في دائرة التغذية الكهربائية داخل الوحدة أو عطل في لوحة التحكم (PCB) يمنع وصول إشارة بدء التشغيل.',
      severityLevel: 'عالٍ',
      partKeys: [
        { key: 'pcb', isRequired: true },
        { key: 'capacitor', isRequired: false },
      ],
    },
  },
  {
    key: 'diag_weak_cooling',
    nodeType: 'diagnosis',
    parentKey: 'pw_weak_cooling',
    confidenceWeight: 0,
    diagnosis: {
      title: 'تبريد ضعيف مع عمل الضاغط بشكل طبيعي — فلتر متسخ أو نقص بسيط في الغاز',
      rootCause: 'تراكم الأتربة على الفلتر أو المبخر يقلل كفاءة التبريد، وقد يصاحبه نقص طفيف في غاز التبريد.',
      severityLevel: 'منخفض',
      partKeys: [{ key: 'filter', isRequired: true }],
    },
  },
  {
    key: 'diag_compressor_dead',
    nodeType: 'diagnosis',
    parentKey: 'pw_compressor_dead',
    confidenceWeight: 0,
    diagnosis: {
      title: 'الضاغط لا يعمل — عطل في الضاغط أو نقص حاد في الغاز',
      rootCause: 'تلف في ملفات الضاغط الكهربائية أو تسريب كبير في غاز التبريد يمنع الضاغط من العمل بشكل كامل.',
      severityLevel: 'حرج',
      partKeys: [
        { key: 'compressor', isRequired: true },
        { key: 'gas', isRequired: true },
      ],
    },
  },
];

async function seedSplitAcDiagnosticTree() {
  const splitAc = await prisma.appliance.findFirst({ where: { nameEn: 'Split AC' } });
  if (!splitAc) {
    throw new Error('لم يتم العثور على "مكيف سبليت" — شغّل seedApplianceMasterIndex أولاً');
  }

  const subsystemIdByKey = new Map<string, string>();
  for (const key of ['cooling_cycle', 'electrical']) {
    const nameEn = key === 'cooling_cycle' ? 'Refrigeration Cycle' : 'Electrical System';
    const subsystem = await prisma.subsystem.findFirst({ where: { applianceId: splitAc.id, nameEn } });
    if (subsystem) subsystemIdByKey.set(key, subsystem.id);
  }

  const partIdByKey = new Map<string, string>();
  for (const part of parts) {
    let record = await prisma.part.findUnique({ where: { sku: part.sku } });
    if (!record) {
      record = await prisma.part.create({
        data: {
          name: part.name,
          sku: part.sku,
          price: part.price,
          storeUrl: part.storeUrl,
          stockStatus: part.stockStatus,
        },
      });
    }
    partIdByKey.set(part.key, record.id);
  }

  // إنشاء العقد من الجذر نزولاً بحيث يكون الأب موجوداً دائماً قبل الابن (parent_node_id FK).
  const nodeIdByKey = new Map<string, string>();
  const remaining = [...demoNodes];
  while (remaining.length > 0) {
    const index = remaining.findIndex((n) => n.parentKey === null || nodeIdByKey.has(n.parentKey));
    if (index === -1) throw new Error('ترتيب عقد غير صالح في بيانات الشجرة التجريبية (أب مفقود)');
    const nodeSeed = remaining.splice(index, 1)[0];

    // المطابقة عبر seedKey مخزّن في metadata JSONB — لا يمكن الاعتماد على
    // (نوع العقدة + نص السؤال + الأب) وحدها لأن عقد paywall/diagnosis الشقيقة
    // تحت نفس الأب تتشارك نوعاً واحداً ونص سؤال فارغ (null) فتتصادم مع بعضها.
    let node = await prisma.diagnosticNode.findFirst({
      where: { applianceId: splitAc.id, metadata: { path: ['seedKey'], equals: nodeSeed.key } },
    });
    if (!node) {
      node = await prisma.diagnosticNode.create({
        data: {
          applianceId: splitAc.id,
          subsystemId: nodeSeed.subsystemKey ? subsystemIdByKey.get(nodeSeed.subsystemKey) : undefined,
          questionText: nodeSeed.questionText,
          nodeType: nodeSeed.nodeType,
          parentNodeId: nodeSeed.parentKey ? nodeIdByKey.get(nodeSeed.parentKey) : undefined,
          confidenceWeight: nodeSeed.confidenceWeight,
          metadata: { seedKey: nodeSeed.key },
        },
      });
    }
    nodeIdByKey.set(nodeSeed.key, node.id);

    if (nodeSeed.diagnosis) {
      let diagnosis = await prisma.diagnosis.findFirst({ where: { finalNodeId: node.id } });
      if (!diagnosis) {
        diagnosis = await prisma.diagnosis.create({
          data: {
            finalNodeId: node.id,
            diagnosisTitle: nodeSeed.diagnosis.title,
            rootCause: nodeSeed.diagnosis.rootCause,
            severityLevel: nodeSeed.diagnosis.severityLevel,
          },
        });
        for (const { key, isRequired } of nodeSeed.diagnosis.partKeys) {
          await prisma.diagnosisPart.create({
            data: {
              diagnosisId: diagnosis.id,
              partId: partIdByKey.get(key)!,
              isRequired,
            },
          });
        }
      }
    }
  }

  // ربط الإجابات بعد إنشاء كل العقد لضمان وجود next_node_id قبل الإشارة إليه.
  for (const nodeSeed of demoNodes) {
    if (!nodeSeed.answers) continue;
    const nodeId = nodeIdByKey.get(nodeSeed.key)!;
    for (const answer of nodeSeed.answers) {
      const existing = await prisma.nodeAnswer.findFirst({ where: { nodeId, answerText: answer.answerText } });
      if (existing) continue;
      await prisma.nodeAnswer.create({
        data: {
          nodeId,
          answerText: answer.answerText,
          nextNodeId: nodeIdByKey.get(answer.nextKey),
        },
      });
    }
  }

  console.log(`✓ شجرة تشخيص تجريبية لـ "مكيف سبليت": ${demoNodes.length} عقدة، ${parts.length} قطع غيار`);
}

async function main() {
  await seedApplianceMasterIndex();
  await seedSplitAcDiagnosticTree();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
