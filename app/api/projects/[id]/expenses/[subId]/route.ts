import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string; subId: string } }) {
  await prisma.expense.delete({
    where: { id: params.subId },
  });
  return NextResponse.json({ success: true });
}
