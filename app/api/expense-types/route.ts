import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const types = await prisma.expenseType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const body = await req.json();
  const type = await prisma.expenseType.create({
    data: { name: body.name, category: body.category },
  });
  return NextResponse.json(type, { status: 201 });
}
