import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      rooms: { select: { id: true, name: true } },
      _count: { select: { rooms: true, expenses: true, payments: true } },
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      clientName: body.clientName,
      phone: body.phone,
      address: body.address,
      projectType: body.projectType,
      initialCost: Number(body.initialCost),
      finalCost: Number(body.initialCost),
      status: body.status || "جديد",
      startDate: body.startDate ? new Date(body.startDate) : null,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      notes: body.notes,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
