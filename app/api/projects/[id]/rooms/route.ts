import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const room = await prisma.room.create({
    data: {
      projectId: params.id,
      name: body.name,
      allocatedCost: Number(body.allocatedCost),
      description: body.description,
      notes: body.notes,
    },
  });
  return NextResponse.json(room, { status: 201 });
}
