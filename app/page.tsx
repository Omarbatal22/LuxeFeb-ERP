"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, TrendingUp, PieChart as PieIcon, BarChart3, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const COLORS = ["#0284c7", "#10b981", "#f59e0b", "#e11d48", "#8b5cf6", "#db2777"];

const barTooltipConfig = { backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" };
const pieTooltipConfig = { backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" };
const BG_CLASSES = ["bg-sky-600", "bg-emerald-500", "bg-amber-500", "bg-rose-600", "bg-violet-500", "bg-pink-600"];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">جاري تحميل البيانات المالية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Premium Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500/30 text-primary-100 border border-primary-400/20 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300" /> لوحة التحكم الذكية
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            مرحباً بك في نظام إدارة حسابات الأثاث 🪑
          </h1>
          <p className="text-primary-100/90 text-sm max-w-xl">
            تابع إيراداتك ومصروفاتك، حلل أرباح المشاريع، وراقب المستحقات المتأخرة للعملاء في مكان واحد وبأعلى دقة.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 z-10">
          <Link
            href="/projects"
            className="bg-white text-primary-900 hover:bg-primary-50 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm flex items-center gap-2 group"
          >
            إدارة المشاريع
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/expenses"
            className="bg-primary-800/80 hover:bg-primary-800 text-white border border-primary-600/50 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 backdrop-blur-sm"
          >
            سجل المصاريف
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-primary-600" size={20} />
          المؤشرات المالية الرئيسية
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard title="إجمالي المشاريع" value={stats.totalProjects} type="number" color="blue" />
          <StatCard title="المشاريع النشطة" value={stats.activeProjects} type="number" color="yellow" trend="up" />
          <StatCard title="إجمالي الإيرادات (المدفوع)" value={stats.totalRevenue} color="green" trend="up" />
          <StatCard title="إجمالي المصاريف" value={stats.totalExpenses} color="red" trend="down" />
          <StatCard title="صافي الربح" value={stats.totalProfit} color={stats.totalProfit >= 0 ? "green" : "red"} trend="up" />
          <StatCard title="مستحقات متأخرة للعملاء" value={stats.pendingPayments} color="purple" trend="neutral" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">التدفقات النقدية الشهرية</h2>
                  <p className="text-xs text-gray-400">إجمالي الدفعات المستلمة من العملاء حسب الشهر</p>
                </div>
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={{ stroke: "#e2e8f0" }} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => formatCurrency(v).replace("ج.م", "").trim()} />
                  <Tooltip
                    contentStyle={barTooltipConfig}
                    formatter={(v: number) => [formatCurrency(v), "الإيرادات"]}
                  />
                  <Bar dataKey="value" fill="url(#primaryGradient)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#36a7f9" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {stats.monthlyChart.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">لا توجد إيرادات مسجلة بعد لعرض الرسم البياني.</p>
          )}
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <PieIcon size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">توزيع المصروفات حسب البند</h2>
                  <p className="text-xs text-gray-400">إجمالي الصرف الموزع على تصنيفات وبنود التكلفة</p>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                    labelLine={false}
                  >
                    {stats.categoryChart.map((_: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={pieTooltipConfig}
                    formatter={(v: number) => [formatCurrency(v), "المبلغ"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend */}
            <div className="flex flex-wrap gap-3 mt-2 justify-center bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
              {stats.categoryChart.map((entry: any, i: number) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-xl border border-gray-200/60 shadow-2xs">
                  <span className={`w-2.5 h-2.5 rounded-full block ${BG_CLASSES[i % BG_CLASSES.length]}`} />
                  {entry.name}
                </div>
              ))}
              {stats.categoryChart.length === 0 && (
                <span className="text-xs text-gray-400">لا توجد مصروفات مسجلة بعد.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
