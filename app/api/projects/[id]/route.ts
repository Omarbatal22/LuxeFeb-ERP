import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      rooms: true,
      costChanges: { orderBy: { changeDate: "desc" } },
      expenses: { include: { expenseType: true, room: true }, orderBy: { expenseDate: "desc" } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      clientName: body.clientName,
      phone: body.phone,
      address: body.address,
      projectType: body.projectType,
      finalCost: body.finalCost != null ? Number(body.finalCost) : undefined,
      status: body.status,
      startDate: body.startDate ? new Date(body.startDate) : null,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
