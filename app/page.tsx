"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="text-center py-20 text-gray-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📊 لوحة التحكم</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="إجمالي المشاريع" value={stats.totalProjects} type="number" color="blue" />
        <StatCard title="المشاريع النشطة" value={stats.activeProjects} type="number" color="yellow" />
        <StatCard title="إجمالي الإيرادات" value={stats.totalRevenue} color="green" trend="up" />
        <StatCard title="إجمالي المصاريف" value={stats.totalExpenses} color="red" trend="down" />
        <StatCard title="صافي الربح" value={stats.totalProfit} color={stats.totalProfit >= 0 ? "green" : "red"} />
        <StatCard title="مستحقات العملاء" value={stats.pendingPayments} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📈 الإيرادات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => formatCurrency(v).replace("ج.م", "")} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🥧 المصاريف حسب النوع</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.categoryChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {stats.categoryChart.map((_: any, i: number) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {stats.categoryChart.map((entry: any, i: number) => (
              <div key={entry.name} className="flex items-center gap-1 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
