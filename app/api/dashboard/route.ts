import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { expenses: true, payments: true },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p: any) => p.status !== "منتهي" && p.status !== "ملغي").length;

    const totalRevenue = projects.reduce((sum: number, p: any) => sum + p.payments.reduce((s: number, pay: any) => s + pay.amount, 0), 0);
    const totalExpenses = projects.reduce((sum: number, p: any) => sum + p.expenses.reduce((s: number, ex: any) => s + ex.amount, 0), 0);
    const totalProfit = totalRevenue - totalExpenses;

    const pendingPayments = projects.reduce((sum: number, p: any) => {
      const paid = p.payments.reduce((s: number, pay: any) => s + pay.amount, 0);
      return sum + Math.max(0, (p.finalCost || 0) - paid);
    }, 0);

    // Chart data: expenses by category
    const allExpenses = await prisma.expense.findMany({ include: { expenseType: true } });
    const categoryMap: Record<string, number> = {};
    allExpenses.forEach((e: any) => {
      const cat = e.expenseType?.category || "غير مصنف";
      categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
    });
    const categoryChart = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Chart data: monthly revenue
    const payments = await prisma.payment.findMany();
    const monthMap: Record<string, number> = {};
    payments.forEach((p: any) => {
      const key = new Date(p.paymentDate).toLocaleString("ar-EG", { month: "short", year: "numeric" });
      monthMap[key] = (monthMap[key] || 0) + p.amount;
    });
    const monthlyChart = Object.entries(monthMap).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      totalProjects,
      activeProjects,
      totalRevenue,
      totalExpenses,
      totalProfit,
      pendingPayments,
      categoryChart,
      monthlyChart,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
