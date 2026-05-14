import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const expenseTypes = [
    { name: "خشب زان", category: "خامات" },
    { name: "خشب موسكي", category: "خامات" },
    { name: "خشب MDF", category: "خامات" },
    { name: "مفصلات واكسسوارات", category: "خامات" },
    { name: "زجاج", category: "خامات" },
    { name: "رخام/جرانيت", category: "خامات" },
    { name: "قماش تنجيد", category: "خامات" },
    { name: "سبريه/بوهيات", category: "خامات" },
    { name: "نجار", category: "عمالة" },
    { name: "فني تركيب", category: "عمالة" },
    { name: "مساعد", category: "عمالة" },
    { name: "دهان", category: "خدمات خارجية" },
    { name: "تنجيد كنب", category: "خدمات خارجية" },
    { name: "تلميع وصيانة", category: "خدمات خارجية" },
    { name: "ديكور جبس", category: "خدمات خارجية" },
    { name: "نقل وشحن", category: "نقل" },
    { name: "كهرباء ورشة", category: "إدارية" },
    { name: "إيجار", category: "إدارية" },
    { name: "مصاريف مكتبية", category: "إدارية" },
  ];

  for (const et of expenseTypes) {
    try {
      await prisma.expenseType.create({ data: et });
    } catch {
      // ignore duplicates
    }
  }

  console.log("✅ Seeded " + expenseTypes.length + " expense types");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
