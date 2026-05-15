import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const payments = await prisma.payment.findMany({
    orderBy: { paymentDate: "desc" },
    include: {
      project: { select: { clientName: true, id: true } },
    },
  });

  const formatted = payments.map((pay) => ({
    ...pay,
    projectName: pay.project?.clientName || "مشروع محذوف",
    projectId: pay.project?.id,
  }));

  return NextResponse.json(formatted);
}
