"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, Plus, Trash2, Save } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "rooms" | "expenses" | "payments" | "changes">("overview");
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

  async function load() {
    const res = await fetch(`/api/projects/${params.id}`);
    setProject(await res.json());
  }

  useEffect(() => { load(); }, [params.id]);
  useEffect(() => {
    fetch("/api/expense-types").then((r) => r.json()).then(setExpenseTypes);
  }, []);

  if (!project) return <div className="text-center py-20 text-gray-500">جاري التحميل...</div>;

  const totalPaid = project.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const totalExpenses = project.expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const remaining = project.finalCost - totalPaid;
  const profit = totalPaid - totalExpenses;

  async function addRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/api/projects/${params.id}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        allocatedCost: Number(form.get("allocatedCost")),
        description: form.get("description"),
      }),
    });
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function addExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/api/projects/${params.id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: form.get("roomId") || null,
        expenseTypeId: form.get("expenseTypeId"),
        vendorName: form.get("vendorName"),
        description: form.get("description"),
        amount: Number(form.get("amount")),
        expenseDate: form.get("expenseDate"),
        paymentMethod: form.get("paymentMethod"),
      }),
    });
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function addPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/api/projects/${params.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(form.get("amount")),
        paymentDate: form.get("paymentDate"),
        paymentMethod: form.get("paymentMethod"),
        reason: form.get("reason"),
      }),
    });
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function addCostChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/api/projects/${params.id}/cost-changes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changeAmount: Number(form.get("changeAmount")),
        reason: form.get("reason"),
      }),
    });
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function updateStatus(newStatus: string) {
    await fetch(`/api/projects/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  const tabs = [
    { key: "overview", label: "📋 ملخص المشروع" },
    { key: "rooms", label: `🏠 الأقسام (${project.rooms.length})` },
    { key: "expenses", label: `💸 المصاريف (${project.expenses.length})` },
    { key: "payments", label: `💰 الدفعات (${project.payments.length})` },
    { key: "changes", label: `📈 تعديلات التكلفة (${project.costChanges.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push("/projects")} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1">
            <ArrowRight size={16} /> رجوع للمشاريع
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.clientName}</h1>
          <p className="text-gray-500 text-sm">{project.projectType} — {project.address || "لا يوجد عنوان"}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={project.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="جديد">جديد</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
            <option value="منتهي">منتهي</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="التكلفة النهائية" value={project.finalCost} color="blue" />
        <SummaryCard title="إجمالي المصاريف" value={totalExpenses} color="red" />
        <SummaryCard title="العميل دفع" value={totalPaid} color="green" />
        <SummaryCard title="باقي على العميل" value={remaining} color="yellow" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SummaryCard title="صافي الربح (بناءً على المدفوع)" value={profit} color={profit >= 0 ? "green" : "red"} />
        <SummaryCard title="التكلفة الابتدائية" value={project.initialCost} color="gray" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t.key ? "bg-white text-primary-700 border-t border-x border-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        {tab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">📋 تفاصيل المشروع</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">التليفون:</span> {project.phone || "-"}</div>
              <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">العنوان:</span> {project.address || "-"}</div>
              <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">تاريخ البدء:</span> {project.startDate ? formatDate(project.startDate) : "-"}</div>
              <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">تاريخ التسليم:</span> {project.deliveryDate ? formatDate(project.deliveryDate) : "-"}</div>
              <div className="bg-gray-50 rounded-lg p-3 md:col-span-2"><span className="text-gray-500">ملاحظات:</span> {project.notes || "-"}</div>
            </div>
            <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-2">📊 تحليل مالي سريع</h3>
              <ul className="space-y-1 text-sm text-primary-800">
                <li>• نسبة الصرف من التكلفة: <strong>{((totalExpenses / project.finalCost) * 100).toFixed(1)}%</strong></li>
                <li>• نسبة التحصيل: <strong>{((totalPaid / project.finalCost) * 100).toFixed(1)}%</strong></li>
                <li>• هامش الربح: <strong>{totalPaid > 0 ? ((profit / totalPaid) * 100).toFixed(1) : 0}%</strong></li>
              </ul>
            </div>
          </div>
        )}

        {tab === "rooms" && (
          <div className="space-y-6">
            <form onSubmit={addRoom} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم القسم</label>
                <input name="name" required placeholder="مثال: غرفة نوم رئيسية" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التكلفة المخصصة</label>
                <input name="allocatedCost" type="number" required className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <input name="description" placeholder="تفاصيل الأثاث" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-1">
                <Plus size={16} /> إضافة
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold"><tr><th className="px-3 py-2">القسم</th><th className="px-3 py-2">التكلفة المخصصة</th><th className="px-3 py-2">الوصف</th><th className="px-3 py-2">المصاريف المرتبطة</th></tr></thead>
                <tbody className="divide-y">
                  {project.rooms.map((r: any) => {
                    const roomExpenses = project.expenses.filter((e: any) => e.roomId === r.id).reduce((s: number, e: any) => s + e.amount, 0);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2">{formatCurrency(r.allocatedCost)}</td>
                        <td className="px-3 py-2 text-gray-500">{r.description || "-"}</td>
                        <td className="px-3 py-2">{formatCurrency(roomExpenses)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div className="space-y-6">
            <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">النوع</label>
                <select name="expenseTypeId" required className="w-full rounded border-gray-300 border px-3 py-2 text-sm">
                  <option value="">اختر...</option>
                  {expenseTypes.map((et) => <option key={et.id} value={et.id}>{et.name} ({et.category})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">القسم (اختياري)</label>
                <select name="roomId" className="w-full rounded border-gray-300 border px-3 py-2 text-sm">
                  <option value="">عام</option>
                  {project.rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المورد/الشخص</label>
                <input name="vendorName" placeholder="مين اللي خد الفلوس" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <input name="description" required placeholder="مثال: خشب زان للمطبخ" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ</label>
                <input name="amount" type="number" required className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ</label>
                  <input name="expenseDate" type="date" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm">
                  <Plus size={16} />
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr><th className="px-3 py-2">التاريخ</th><th className="px-3 py-2">النوع</th><th className="px-3 py-2">المورد</th><th className="px-3 py-2">الوصف</th><th className="px-3 py-2">القسم</th><th className="px-3 py-2">المبلغ</th></tr>
                </thead>
                <tbody className="divide-y">
                  {project.expenses.map((ex: any) => (
                    <tr key={ex.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500">{formatDate(ex.expenseDate)}</td>
                      <td className="px-3 py-2"><span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100">{ex.expenseType?.name}</span></td>
                      <td className="px-3 py-2">{ex.vendorName || "-"}</td>
                      <td className="px-3 py-2">{ex.description}</td>
                      <td className="px-3 py-2 text-gray-500">{ex.room?.name || "عام"}</td>
                      <td className="px-3 py-2 font-semibold text-red-600">{formatCurrency(ex.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-6">
            <form onSubmit={addPayment} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ</label>
                <input name="amount" type="number" required className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ</label>
                <input name="paymentDate" type="date" required className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select name="paymentMethod" className="w-full rounded border-gray-300 border px-3 py-2 text-sm">
                  <option>كاش</option>
                  <option>تحويل بنكي</option>
                  <option>شيك</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">السبب</label>
                <select name="reason" className="w-full rounded border-gray-300 border px-3 py-2 text-sm">
                  <option>عربون</option>
                  <option>دفعة مرحلية</option>
                  <option>دفعة نهائية</option>
                </select>
              </div>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-1">
                <Plus size={16} /> تسجيل دفعة
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr><th className="px-3 py-2">التاريخ</th><th className="px-3 py-2">السبب</th><th className="px-3 py-2">الطريقة</th><th className="px-3 py-2">المبلغ</th><th className="px-3 py-2">المتبقي بعدها</th></tr>
                </thead>
                <tbody className="divide-y">
                  {(() => {
                    let runningRemaining = project.finalCost;
                    return project.payments.map((p: any) => {
                      runningRemaining -= p.amount;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-500">{formatDate(p.paymentDate)}</td>
                          <td className="px-3 py-2">{p.reason}</td>
                          <td className="px-3 py-2">{p.paymentMethod}</td>
                          <td className="px-3 py-2 font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2 font-medium">{formatCurrency(Math.max(0, runningRemaining))}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "changes" && (
          <div className="space-y-6">
            <form onSubmit={addCostChange} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">مبلغ الزيادة/النقصان</label>
                <input name="changeAmount" type="number" required placeholder="اكتب سالب لو النقصان" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">السبب</label>
                <input name="reason" required placeholder="مثال: إضافة دولاب إضافي" className="w-full rounded border-gray-300 border px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-1">
                <Save size={16} /> تعديل التكلفة
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr><th className="px-3 py-2">التاريخ</th><th className="px-3 py-2">التكلفة قبل</th><th className="px-3 py-2">التعديل</th><th className="px-3 py-2">التكلفة بعد</th><th className="px-3 py-2">السبب</th></tr>
                </thead>
                <tbody className="divide-y">
                  {project.costChanges.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500">{formatDate(c.changeDate)}</td>
                      <td className="px-3 py-2">{formatCurrency(c.oldCost)}</td>
                      <td className={`px-3 py-2 font-semibold ${c.changeAmount >= 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {c.changeAmount > 0 ? "+" : ""}{formatCurrency(c.changeAmount)}
                      </td>
                      <td className="px-3 py-2 font-bold">{formatCurrency(c.oldCost + c.changeAmount)}</td>
                      <td className="px-3 py-2">{c.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    red: "bg-red-50 border-red-200 text-red-900",
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    yellow: "bg-amber-50 border-amber-200 text-amber-900",
    gray: "bg-gray-50 border-gray-200 text-gray-900",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-80 mb-1">{title}</p>
      <p className="text-xl font-bold">{formatCurrency(value)}</p>
    </div>
  );
}
