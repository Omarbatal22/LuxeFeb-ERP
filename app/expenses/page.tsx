"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye, Search, Receipt, Trash2, Plus } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New states for inline addition
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  async function loadData() {
    setLoading(true);
    const [resEx, resProj, resTypes] = await Promise.all([
      fetch("/api/expenses"),
      fetch("/api/projects"),
      fetch("/api/expense-types"),
    ]);
    if (resEx.ok) setExpenses(await resEx.json());
    if (resProj.ok) setProjects(await resProj.json());
    if (resTypes.ok) setExpenseTypes(await resTypes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function deleteExpense(projectId: string, id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    await fetch(`/api/projects/${projectId}/expenses/${id}`, { method: "DELETE" });
    // Refresh expenses
    const resEx = await fetch("/api/expenses");
    if (resEx.ok) setExpenses(await resEx.json());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProjectId) {
      alert("يرجى اختيار المشروع المستهدف أولاً");
      return;
    }
    setLoadingSubmit(true);
    const form = new FormData(e.currentTarget);
    const body = {
      roomId: form.get("roomId") || null,
      expenseTypeId: form.get("expenseTypeId"),
      vendorName: form.get("vendorName"),
      description: form.get("description"),
      amount: Number(form.get("amount")),
      expenseDate: form.get("expenseDate"),
      paymentMethod: form.get("paymentMethod") || "كاش",
    };

    await fetch(`/api/projects/${selectedProjectId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoadingSubmit(false);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
    
    // Instantly refresh list
    const resEx = await fetch("/api/expenses");
    if (resEx.ok) setExpenses(await resEx.json());
  }

  const filteredExpenses = expenses.filter((ex) => {
    const matchesSearch =
      ex.projectName.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase()) ||
      (ex.vendorName && ex.vendorName.toLowerCase().includes(search.toLowerCase())) ||
      (ex.expenseType?.name && ex.expenseType.name.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const currentRooms = currentProject?.rooms || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Receipt className="text-rose-600" size={24} />
            السجل الشامل للمصروفات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مراجعة كافة حركات الصرف المسجلة على جميع المشاريع والأقسام مع إمكانية البحث والتتبع.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick summary stat inside header */}
          <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl text-left">
            <span className="text-xs font-bold text-rose-700 block">إجمالي المعروض:</span>
            <span className="text-lg font-extrabold text-rose-950">{formatCurrency(totalFilteredAmount)}</span>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 self-stretch sm:self-auto"
          >
            <Plus size={18} />
            {showForm ? "إخفاء النموذج" : "إضافة مصروف"}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-rose-50/40 to-white p-6 rounded-3xl border border-rose-100 shadow-xs space-y-4 animate-fade-in">
          <h2 className="text-base font-extrabold text-gray-900">تسجيل مصروف جديد مباشرة على مشروع</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="projectSelect" className="block text-xs font-bold text-gray-700 mb-1.5">المشروع المستهدف *</label>
              <select
                id="projectSelect"
                title="المشروع المستهدف"
                aria-label="المشروع المستهدف"
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="">اختر المشروع...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clientName} ({p.projectType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expenseTypeSelect" className="block text-xs font-bold text-gray-700 mb-1.5">بند الصرف *</label>
              <select
                id="expenseTypeSelect"
                name="expenseTypeId"
                title="بند الصرف"
                aria-label="بند الصرف"
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="">اختر البند...</option>
                {expenseTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name} ({et.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expenseRoomSelect" className="block text-xs font-bold text-gray-700 mb-1.5">القسم (اختياري)</label>
              <select
                id="expenseRoomSelect"
                name="roomId"
                title="القسم"
                aria-label="القسم"
                disabled={!selectedProjectId}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="">مصروف عام</option>
                {currentRooms.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expenseVendorInput" className="block text-xs font-bold text-gray-700 mb-1.5">المستفيد/المورد</label>
              <input
                id="expenseVendorInput"
                name="vendorName"
                title="المستفيد أو المورد"
                aria-label="المستفيد أو المورد"
                placeholder="لمن صُرفت"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="expenseDescInput" className="block text-xs font-bold text-gray-700 mb-1.5">البيان/الوصف *</label>
              <input
                id="expenseDescInput"
                name="description"
                title="البيان أو الوصف"
                aria-label="البيان أو الوصف"
                required
                placeholder="تفاصيل الصرف"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              />
            </div>

            <div>
              <label htmlFor="expenseAmountInput" className="block text-xs font-bold text-gray-700 mb-1.5">المبلغ *</label>
              <input
                id="expenseAmountInput"
                name="amount"
                title="المبلغ المصروف"
                aria-label="المبلغ المصروف"
                type="number"
                required
                min="1"
                placeholder="ج.م"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-extrabold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              />
            </div>

            <div>
              <label htmlFor="expenseDateInput" className="block text-xs font-bold text-gray-700 mb-1.5">التاريخ</label>
              <input
                id="expenseDateInput"
                name="expenseDate"
                title="تاريخ الصرف"
                aria-label="تاريخ الصرف"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-gray-200 px-2 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-xs disabled:opacity-50"
            >
              {loadingSubmit ? "جاري الحفظ..." : "حفظ المصروف"}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            title="بحث في المصروفات"
            aria-label="بحث في المصروفات"
            placeholder="ابحث باسم المشروع، البيان، المستفيد، أو البند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
              <tr>
                <th className="px-5 py-3.5">التاريخ</th>
                <th className="px-5 py-3.5">المشروع</th>
                <th className="px-5 py-3.5">البند</th>
                <th className="px-5 py-3.5">المستفيد/المورد</th>
                <th className="px-5 py-3.5">البيان/الوصف</th>
                <th className="px-5 py-3.5">القسم</th>
                <th className="px-5 py-3.5">المبلغ</th>
                <th className="px-5 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 font-bold">
                    جاري تحميل سجل المصروفات...
                  </td>
                </tr>
              ) : filteredExpenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-bold">
                    {formatDate(ex.expenseDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/projects/${ex.projectId}`} className="font-extrabold text-primary-700 hover:underline">
                      {ex.projectName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-extrabold bg-gray-100 text-gray-800 border border-gray-200/60">
                      {ex.expenseType?.name || "بند محذوف"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {ex.vendorName || "-"}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    {ex.description}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-bold">
                    {ex.room?.name || "عام"}
                  </td>
                  <td className="px-5 py-3.5 font-extrabold text-rose-600">
                    {formatCurrency(ex.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/projects/${ex.projectId}`}
                        title="عرض تفاصيل المشروع"
                        className="bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white p-1.5 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => deleteExpense(ex.projectId, ex.id)}
                        title="حذف المصروف"
                        aria-label="حذف المصروف"
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 font-bold text-sm">
                    {expenses.length === 0
                      ? "لا توجد مصروفات مسجلة في النظام حتى الآن."
                      : "لا توجد نتائج مطابقة لبحثك."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
