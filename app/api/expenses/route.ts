import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expenses = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" },
    include: {
      project: { select: { clientName: true, id: true } },
      expenseType: true,
      room: { select: { name: true } },
    },
  });

  const formatted = expenses.map((ex) => ({
    ...ex,
    projectName: ex.project?.clientName || "مشروع محذوف",
    projectId: ex.project?.id,
  }));

  return NextResponse.json(formatted);
}
