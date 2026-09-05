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

async function main() {
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
