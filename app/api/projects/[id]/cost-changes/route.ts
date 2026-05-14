import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldCost = project.finalCost;
  const changeAmount = Number(body.changeAmount);
  const newCost = oldCost + changeAmount;

  await prisma.costChange.create({
    data: {
      projectId: params.id,
      oldCost,
      changeAmount,
      reason: body.reason,
      changeDate: new Date(),
    },
  });

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: { finalCost: newCost },
  });

  return NextResponse.json(updated);
}
