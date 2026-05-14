import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const expense = await prisma.expense.create({
    data: {
      projectId: params.id,
      roomId: body.roomId || null,
      expenseTypeId: body.expenseTypeId,
      vendorName: body.vendorName,
      description: body.description,
      amount: Number(body.amount),
      expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
      paymentMethod: body.paymentMethod || "كاش",
      notes: body.notes,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
