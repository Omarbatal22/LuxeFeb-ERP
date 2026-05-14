import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // Check if there are associated expenses
  const count = await prisma.expense.count({
    where: { expenseTypeId: params.id },
  });

  if (count > 0) {
    return NextResponse.json(
      { error: "لا يمكن حذف هذا النوع لوجود مصاريف مسجلة مرتبطة به." },
      { status: 400 }
    );
  }

  await prisma.expenseType.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
