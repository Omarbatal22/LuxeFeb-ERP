import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { expenses: true, payments: true },
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status !== "منتهي" && p.status !== "ملغي").length;

  const totalRevenue = projects.reduce((sum, p) => sum + p.payments.reduce((s, pay) => s + pay.amount, 0), 0);
  const totalExpenses = projects.reduce((sum, p) => sum + p.expenses.reduce((s, ex) => s + ex.amount, 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  const pendingPayments = projects.reduce((sum, p) => {
    const paid = p.payments.reduce((s, pay) => s + pay.amount, 0);
    return sum + Math.max(0, p.finalCost - paid);
  }, 0);

  // Chart data: expenses by category
  const allExpenses = await prisma.expense.findMany({ include: { expenseType: true } });
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach((e) => {
    const cat = e.expenseType?.category || "غير مصنف";
    categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
  });
  const categoryChart = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Chart data: monthly revenue
  const payments = await prisma.payment.findMany();
  const monthMap: Record<string, number> = {};
  payments.forEach((p) => {
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
}
