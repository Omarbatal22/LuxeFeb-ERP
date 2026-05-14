"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, Plus, Trash2, Save, Layers, Receipt, CreditCard, RefreshCw } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "rooms" | "expenses" | "payments" | "changes">("overview");
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  async function load() {
    const res = await fetch(`/api/projects/${params.id}`);
    if (res.ok) {
      setProject(await res.json());
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  useEffect(() => {
    fetch("/api/expense-types")
      .then((r) => r.json())
      .then(setExpenseTypes);
  }, []);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-gray-500 font-bold">جاري تحميل تفاصيل المشروع...</p>
      </div>
    );
  }

  const totalPaid = project.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const totalExpenses = project.expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const remaining = project.finalCost - totalPaid;
  const profit = totalPaid - totalExpenses;

  // Percentage stats safely capped
  const expensePercent = project.finalCost > 0 ? Math.min(100, Math.round((totalExpenses / project.finalCost) * 100)) : 0;
  const collectionPercent = project.finalCost > 0 ? Math.min(100, Math.round((totalPaid / project.finalCost) * 100)) : 0;

  async function addRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingAction(true);
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
    await load();
    setLoadingAction(false);
  }

  async function addExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingAction(true);
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
    await load();
    setLoadingAction(false);
  }

  async function addPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingAction(true);
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
    await load();
    setLoadingAction(false);
  }

  async function addCostChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingAction(true);
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
    await load();
    setLoadingAction(false);
  }

  async function updateStatus(newStatus: string) {
    await fetch(`/api/projects/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  // Deletion functions
  async function deleteRoom(subId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ لن يتم حذف المصاريف المرتبطة بل ستصبح عامة.")) return;
    await fetch(`/api/projects/${params.id}/rooms/${subId}`, { method: "DELETE" });
    load();
  }

  async function deleteExpense(subId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    await fetch(`/api/projects/${params.id}/expenses/${subId}`, { method: "DELETE" });
    load();
  }

  async function deletePayment(subId: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الدفعة؟")) return;
    await fetch(`/api/projects/${params.id}/payments/${subId}`, { method: "DELETE" });
    load();
  }

  async function deleteCostChange(subId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا التعديل؟ سيتم إرجاع التكلفة النهائية للمشروع تلقائياً.")) return;
    await fetch(`/api/projects/${params.id}/cost-changes/${subId}`, { method: "DELETE" });
    load();
  }

  const tabs = [
    { key: "overview", label: "📋 ملخص المشروع" },
    { key: "rooms", label: `🏠 الأقسام (${project.rooms.length})` },
    { key: "expenses", label: `💸 المصاريف (${project.expenses.length})` },
    { key: "payments", label: `💰 الدفعات (${project.payments.length})` },
    { key: "changes", label: `📈 تعديلات التكلفة (${project.costChanges.length})` },
  ];

  const statusBadgeColor: Record<string, string> = {
    "جديد": "bg-blue-50 text-blue-700 border-blue-200",
    "قيد التنفيذ": "bg-amber-50 text-amber-700 border-amber-200",
    "منتهي": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "ملغي": "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/projects")}
          className="text-sm font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1.5 transition-all bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-2xs hover:bg-gray-50"
        >
          <ArrowRight size={16} /> رجوع لقائمة المشاريع
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="topStatusSelect" className="text-xs font-bold text-gray-400">تغيير الحالة:</label>
          <select
            id="topStatusSelect"
            title="تغيير حالة المشروع"
            aria-label="تغيير حالة المشروع"
            value={project.status}
            onChange={(e) => updateStatus(e.target.value)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer ${
              statusBadgeColor[project.status] || "bg-white text-gray-800 border-gray-200"
            }`}
          >
            <option value="جديد">جديد</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
            <option value="منتهي">منتهي</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary-500 to-primary-700" />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {project.clientName}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadgeColor[project.status] || "bg-gray-100 text-gray-800"}`}>
              {project.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm font-semibold text-gray-500">
            <span>🏷️ النوع: <strong className="text-gray-700">{project.projectType}</strong></span>
            <span>📍 العنوان: <strong className="text-gray-700">{project.address || "غير مسجل"}</strong></span>
            <span>📞 الهاتف: <strong className="text-gray-700" dir="ltr">{project.phone || "غير مسجل"}</strong></span>
          </div>
        </div>

        {/* Progress indicators summary */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100/80 min-w-[280px]">
          <style>{`
            .custom-progress-col { width: ${collectionPercent}%; }
            .custom-progress-exp { width: ${expensePercent}%; }
          `}</style>
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-700">التحصيل</span>
              <span>{collectionPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 custom-progress-col" />
            </div>
          </div>
          
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-rose-700">نسبة الصرف</span>
              <span>{expensePercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500 custom-progress-exp" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="التكلفة النهائية (المطلوبة)" value={project.finalCost} color="blue" />
        <SummaryCard title="إجمالي المصاريف الفعلية" value={totalExpenses} color="red" />
        <SummaryCard title="إجمالي ما دفعه العميل" value={totalPaid} color="green" />
        <SummaryCard title="المتبقي على العميل" value={remaining} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SummaryCard title="صافي الربح الحالي (المدفوع - المصاريف)" value={profit} color={profit >= 0 ? "green" : "red"} />
        <SummaryCard title="التكلفة الابتدائية (التقديرية)" value={project.initialCost} color="gray" />
      </div>

      {/* Tabs navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-wrap gap-1">
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all duration-200 text-center ${
                isActive
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-7 transition-all">
        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900">📋 التواريخ والملاحظات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-1">
                <span className="text-xs font-bold text-gray-400">تاريخ البدء:</span>
                <p className="font-bold text-gray-800">{project.startDate ? formatDate(project.startDate) : "غير محدد"}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-1">
                <span className="text-xs font-bold text-gray-400">تاريخ التسليم المتوقع:</span>
                <p className="font-bold text-gray-800">{project.deliveryDate ? formatDate(project.deliveryDate) : "غير محدد"}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 md:col-span-2 space-y-1">
                <span className="text-xs font-bold text-gray-400">ملاحظات إضافية على المشروع:</span>
                <p className="font-bold text-gray-800 whitespace-pre-wrap">{project.notes || "لا توجد ملاحظات مدونة."}</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-100">
              <h3 className="font-extrabold text-primary-950 mb-3 flex items-center gap-1.5 text-sm">
                💡 إرشادات لوحة المشروع
              </h3>
              <p className="text-xs font-semibold text-primary-800 leading-relaxed space-y-1">
                • يمكنك توزيع الأثاث إلى <strong>أقسام/غرف</strong> وتحديد تكلفة مقدرة لكل قسم للمقارنة.<br />
                • عند تسجيل <strong>مصروف</strong>، يُفضل ربطه ببند الصرف المناسب والقسم الخاص به لضمان دقة الرسوم البيانية.<br />
                • في حال إضافة تعديلات على الاتفاق (زيادة أو نقصان)، استخدم علامة التبويب <strong>تعديلات التكلفة</strong> ليتم تحديث التكلفة النهائية للمشروع تلقائياً.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Rooms */}
        {tab === "rooms" && (
          <div className="space-y-6 animate-fade-in">
            <form onSubmit={addRoom} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div>
                <label htmlFor="roomNameInput" className="block text-xs font-bold text-gray-700 mb-1.5">اسم القسم/الغرفة *</label>
                <input id="roomNameInput" name="name" title="اسم القسم" aria-label="اسم القسم" required placeholder="مثال: صالون، مطبخ، غرفة نوم..." className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
              </div>
              <div>
                <label htmlFor="roomAllocatedCost" className="block text-xs font-bold text-gray-700 mb-1.5">التكلفة المخصصة التقديرية *</label>
                <input id="roomAllocatedCost" name="allocatedCost" title="التكلفة المخصصة التقديرية" aria-label="التكلفة المخصصة التقديرية" type="number" required min="0" placeholder="المبلغ المتوقع للقسم" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
              </div>
              <div>
                <label htmlFor="roomDescInput" className="block text-xs font-bold text-gray-700 mb-1.5">الوصف (اختياري)</label>
                <input id="roomDescInput" name="description" title="وصف القسم" aria-label="وصف القسم" placeholder="تفاصيل القطع المشمولة" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
              </div>
              <button type="submit" disabled={loadingAction} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 h-[38px] shadow-xs disabled:opacity-50">
                <Plus size={16} /> إضافة قسم
              </button>
            </form>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
                  <tr>
                    <th className="px-4 py-3">القسم</th>
                    <th className="px-4 py-3">التكلفة المخصصة</th>
                    <th className="px-4 py-3">الوصف</th>
                    <th className="px-4 py-3">إجمالي المنصرف عليه</th>
                    <th className="px-4 py-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {project.rooms.map((r: any) => {
                    const roomExpenses = project.expenses.filter((e: any) => e.roomId === r.id).reduce((s: number, e: any) => s + e.amount, 0);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900">{r.name}</td>
                        <td className="px-4 py-3 font-bold text-primary-700">{formatCurrency(r.allocatedCost)}</td>
                        <td className="px-4 py-3 text-gray-500">{r.description || "-"}</td>
                        <td className="px-4 py-3 font-semibold text-rose-600">{formatCurrency(roomExpenses)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => deleteRoom(r.id)} title="حذف القسم" aria-label="حذف القسم" className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {project.rooms.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs font-bold">لا توجد أقسام مسجلة. أضف قسماً لترتيب حساباتك بشكل أفضل.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Expenses */}
        {tab === "expenses" && (
          <div className="space-y-6 animate-fade-in">
            <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end bg-gradient-to-br from-rose-50/40 to-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
              <div className="lg:col-span-2">
                <label htmlFor="expenseTypeSelect" className="block text-xs font-bold text-gray-700 mb-1.5">بند الصرف *</label>
                <select id="expenseTypeSelect" name="expenseTypeId" title="بند الصرف" aria-label="بند الصرف" required className="w-full rounded-xl border-gray-200 border px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                  <option value="">اختر البند...</option>
                  {expenseTypes.map((et) => <option key={et.id} value={et.id}>{et.name} ({et.category})</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="expenseRoomSelect" className="block text-xs font-bold text-gray-700 mb-1.5">القسم (اختياري)</label>
                <select id="expenseRoomSelect" name="roomId" title="القسم" aria-label="القسم" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                  <option value="">مصروف عام</option>
                  {project.rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="lg:col-span-1">
                <label htmlFor="expenseVendorInput" className="block text-xs font-bold text-gray-700 mb-1.5">المستفيد/المورد</label>
                <input id="expenseVendorInput" name="vendorName" title="المستفيد أو المورد" aria-label="المستفيد أو المورد" placeholder="لمن صُرفت" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white" />
              </div>
              <div className="lg:col-span-1">
                <label htmlFor="expenseDescInput" className="block text-xs font-bold text-gray-700 mb-1.5">البيان/الوصف *</label>
                <input id="expenseDescInput" name="description" title="البيان أو الوصف" aria-label="البيان أو الوصف" required placeholder="تفاصيل الصرف" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white" />
              </div>
              <div className="lg:col-span-1">
                <label htmlFor="expenseAmountInput" className="block text-xs font-bold text-gray-700 mb-1.5">المبلغ *</label>
                <input id="expenseAmountInput" name="amount" title="المبلغ المصروف" aria-label="المبلغ المصروف" type="number" required min="1" placeholder="ج.م" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white" />
              </div>
              <div className="lg:col-span-1 flex gap-1.5">
                <div className="flex-1">
                  <label htmlFor="expenseDateInput" className="block text-xs font-bold text-gray-700 mb-1.5">التاريخ</label>
                  <input id="expenseDateInput" name="expenseDate" title="تاريخ الصرف" aria-label="تاريخ الصرف" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border-gray-200 border px-2 py-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white" />
                </div>
                <button type="submit" disabled={loadingAction} title="إضافة المصروف" aria-label="إضافة المصروف" className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-center h-[36px] shadow-xs disabled:opacity-50 self-end">
                  <Plus size={18} />
                </button>
              </div>
            </form>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
                  <tr>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">البند</th>
                    <th className="px-4 py-3">المستفيد</th>
                    <th className="px-4 py-3">البيان</th>
                    <th className="px-4 py-3">القسم</th>
                    <th className="px-4 py-3">المبلغ</th>
                    <th className="px-4 py-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {project.expenses.map((ex: any) => (
                    <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs font-bold">{formatDate(ex.expenseDate)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-extrabold bg-gray-100 text-gray-800 border border-gray-200/60">
                          {ex.expenseType?.name || "بند محذوف"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ex.vendorName || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{ex.description}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-bold">{ex.room?.name || "مصروف عام"}</td>
                      <td className="px-4 py-3 font-extrabold text-rose-600">{formatCurrency(ex.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteExpense(ex.id)} title="حذف المصروف" aria-label="حذف المصروف" className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {project.expenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs font-bold">لا توجد مصروفات مسجلة على هذا المشروع حتى الآن.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Payments */}
        {tab === "payments" && (
          <div className="space-y-6 animate-fade-in">
            <form onSubmit={addPayment} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gradient-to-br from-emerald-50/40 to-white p-5 rounded-2xl border border-emerald-100 shadow-2xs">
              <div>
                <label htmlFor="paymentAmountInput" className="block text-xs font-bold text-gray-700 mb-1.5">المبلغ المدفوع *</label>
                <input id="paymentAmountInput" name="amount" title="المبلغ المدفوع" aria-label="المبلغ المدفوع" type="number" required min="1" placeholder="ج.م" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
              </div>
              <div>
                <label htmlFor="paymentDateInput" className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ الدفع *</label>
                <input id="paymentDateInput" name="paymentDate" title="تاريخ الدفع" aria-label="تاريخ الدفع" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
              </div>
              <div>
                <label htmlFor="paymentMethodSelect" className="block text-xs font-bold text-gray-700 mb-1.5">وسيلة الدفع</label>
                <select id="paymentMethodSelect" name="paymentMethod" title="وسيلة الدفع" aria-label="وسيلة الدفع" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option>كاش</option>
                  <option>تحويل بنكي</option>
                  <option>شيك</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentReasonSelect" className="block text-xs font-bold text-gray-700 mb-1.5">نوع الدفعة</label>
                <select id="paymentReasonSelect" name="reason" title="نوع الدفعة" aria-label="نوع الدفعة" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option>عربون</option>
                  <option>دفعة مرحلية</option>
                  <option>دفعة نهائية</option>
                </select>
              </div>
              <button type="submit" disabled={loadingAction} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 h-[38px] shadow-xs disabled:opacity-50">
                <Plus size={16} /> تسجيل دفعة
              </button>
            </form>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
                  <tr>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">نوع الدفعة</th>
                    <th className="px-4 py-3">الوسيلة</th>
                    <th className="px-4 py-3">المبلغ</th>
                    <th className="px-4 py-3">المتبقي على العميل بعدها</th>
                    <th className="px-4 py-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {(() => {
                    let runningRemaining = project.finalCost;
                    return project.payments.map((p: any) => {
                      runningRemaining -= p.amount;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-gray-500 text-xs font-bold">{formatDate(p.paymentDate)}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{p.reason}</td>
                          <td className="px-4 py-3 text-gray-600">{p.paymentMethod}</td>
                          <td className="px-4 py-3 font-extrabold text-emerald-600">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-3 font-extrabold text-gray-800">{formatCurrency(Math.max(0, runningRemaining))}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => deletePayment(p.id)} title="حذف الدفعة" aria-label="حذف الدفعة" className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                  {project.payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs font-bold">لا توجد دفعات مسجلة للعميل حتى الآن.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Cost Changes */}
        {tab === "changes" && (
          <div className="space-y-6 animate-fade-in">
            <form onSubmit={addCostChange} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-gradient-to-br from-amber-50/40 to-white p-5 rounded-2xl border border-amber-100 shadow-2xs">
              <div>
                <label htmlFor="changeAmountInput" className="block text-xs font-bold text-gray-700 mb-1.5">قيمة التعديل (اكتب بالسالب للخصم) *</label>
                <input id="changeAmountInput" name="changeAmount" title="قيمة التعديل" aria-label="قيمة التعديل" type="number" required placeholder="مثال: 5000 أو -2000" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
              </div>
              <div>
                <label htmlFor="changeReasonInput" className="block text-xs font-bold text-gray-700 mb-1.5">السبب / التفاصيل *</label>
                <input id="changeReasonInput" name="reason" title="السبب أو التفاصيل" aria-label="السبب أو التفاصيل" required placeholder="مثال: إضافة مكتبة تلفزيون إضافية" className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
              </div>
              <button type="submit" disabled={loadingAction} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 h-[38px] shadow-xs disabled:opacity-50">
                <Save size={16} /> اعتماد التعديل
              </button>
            </form>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
                  <tr>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">التكلفة قبل</th>
                    <th className="px-4 py-3">قيمة التعديل</th>
                    <th className="px-4 py-3">التكلفة بعد</th>
                    <th className="px-4 py-3">السبب</th>
                    <th className="px-4 py-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {project.costChanges.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs font-bold">{formatDate(c.changeDate)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-600">{formatCurrency(c.oldCost)}</td>
                      <td className={`px-4 py-3 font-extrabold ${c.changeAmount >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {c.changeAmount > 0 ? "+" : ""}{formatCurrency(c.changeAmount)}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-primary-700">{formatCurrency(c.oldCost + c.changeAmount)}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{c.reason}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteCostChange(c.id)} title="حذف التعديل" aria-label="حذف التعديل" className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {project.costChanges.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs font-bold">لا توجد تعديلات مسجلة على التكلفة النهائية للمشروع.</td>
                    </tr>
                  )}
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
  const borderMap: Record<string, string> = {
    blue: "hover:border-primary-300",
    red: "hover:border-rose-300",
    green: "hover:border-emerald-300",
    yellow: "hover:border-amber-300",
    gray: "hover:border-gray-300",
  };
  const stripMap: Record<string, string> = {
    blue: "bg-primary-500",
    red: "bg-rose-500",
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    gray: "bg-gray-400",
  };
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs transition-all hover:shadow-xs relative overflow-hidden ${borderMap[color] || ""}`}>
      <div className={`absolute top-0 right-0 w-1 h-full ${stripMap[color] || "bg-gray-400"}`} />
      <p className="text-xs font-bold text-gray-500 mb-1 mr-1.5">{title}</p>
      <p className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 mr-1.5">{formatCurrency(value)}</p>
    </div>
  );
}
