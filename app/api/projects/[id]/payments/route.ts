import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const payment = await prisma.payment.create({
    data: {
      projectId: params.id,
      amount: Number(body.amount),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      paymentMethod: body.paymentMethod || "كاش",
      reason: body.reason || "دفعة",
      notes: body.notes,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
