import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string; subId: string } }) {
  const costChange = await prisma.costChange.findUnique({
    where: { id: params.subId },
  });
  if (!costChange) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.costChange.delete({
    where: { id: params.subId },
  });

  // Revert the project's final cost
  await prisma.project.update({
    where: { id: params.id },
    data: {
      finalCost: {
        decrement: costChange.changeAmount,
      },
    },
  });

  return NextResponse.json({ success: true });
}
