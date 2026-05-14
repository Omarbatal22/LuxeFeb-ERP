"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye, Search, CreditCard, Trash2, Plus } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New states for inline addition
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  async function loadData() {
    setLoading(true);
    const [resPay, resProj] = await Promise.all([
      fetch("/api/payments"),
      fetch("/api/projects"),
    ]);
    if (resPay.ok) setPayments(await resPay.json());
    if (resProj.ok) setProjects(await resProj.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function deletePayment(projectId: string, id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الدفعة؟")) return;
    await fetch(`/api/projects/${projectId}/payments/${id}`, { method: "DELETE" });
    // Refresh payments
    const resPay = await fetch("/api/payments");
    if (resPay.ok) setPayments(await resPay.json());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProjectId) {
      alert("يرجى اختيار العميل/المشروع المستهدف أولاً");
      return;
    }
    setLoadingSubmit(true);
    const form = new FormData(e.currentTarget);
    const body = {
      amount: Number(form.get("amount")),
      paymentDate: form.get("paymentDate"),
      paymentMethod: form.get("paymentMethod") || "كاش",
      reason: form.get("reason") || "دفعة",
    };

    await fetch(`/api/projects/${selectedProjectId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoadingSubmit(false);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();

    // Instantly refresh list
    const resPay = await fetch("/api/payments");
    if (resPay.ok) setPayments(await resPay.json());
  }

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.reason.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentMethod.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalFilteredAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-emerald-600" size={24} />
            سجل المقبوضات ودفعات العملاء
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            متابعة إجمالي المبالغ والدفعات المستلمة من كافة العملاء مع تفاصيل وسيلة الدفع والسبب.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick summary stat inside header */}
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-left">
            <span className="text-xs font-bold text-emerald-700 block">إجمالي التحصيل المعروض:</span>
            <span className="text-lg font-extrabold text-emerald-950">{formatCurrency(totalFilteredAmount)}</span>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 self-stretch sm:self-auto"
          >
            <Plus size={18} />
            {showForm ? "إخفاء النموذج" : "إضافة دفعة"}
          </button>
        </div>
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-emerald-50/40 to-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4 animate-fade-in">
          <h2 className="text-base font-extrabold text-gray-900">تسجيل دفعة مستلمة مباشرة لحساب مشروع</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="projectSelect" className="block text-xs font-bold text-gray-700 mb-1.5">المشروع/العميل *</label>
              <select
                id="projectSelect"
                title="المشروع أو العميل"
                aria-label="المشروع أو العميل"
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="">اختر المشروع/العميل...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clientName} ({p.projectType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="paymentReasonInput" className="block text-xs font-bold text-gray-700 mb-1.5">نوع/سبب الدفعة *</label>
              <input
                id="paymentReasonInput"
                name="reason"
                title="نوع أو سبب الدفعة"
                aria-label="نوع أو سبب الدفعة"
                required
                defaultValue="دفعة من الحساب"
                placeholder="مثال: دفعة مقدمة، دفعة استلام..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>

            <div>
              <label htmlFor="paymentMethodSelect" className="block text-xs font-bold text-gray-700 mb-1.5">وسيلة الدفع</label>
              <select
                id="paymentMethodSelect"
                name="paymentMethod"
                title="وسيلة الدفع"
                aria-label="وسيلة الدفع"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="كاش">كاش</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="إنستاباي">إنستاباي (InstaPay)</option>
                <option value="فودافون كاش">فودافون كاش</option>
                <option value="شيك">شيك</option>
              </select>
            </div>

            <div>
              <label htmlFor="paymentAmountInput" className="block text-xs font-bold text-gray-700 mb-1.5">المبلغ المستلم *</label>
              <input
                id="paymentAmountInput"
                name="amount"
                title="المبلغ المستلم"
                aria-label="المبلغ المستلم"
                type="number"
                required
                min="1"
                placeholder="ج.م"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-extrabold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>

            <div>
              <label htmlFor="paymentDateInput" className="block text-xs font-bold text-gray-700 mb-1.5">التاريخ</label>
              <input
                id="paymentDateInput"
                name="paymentDate"
                title="تاريخ الاستلام"
                aria-label="تاريخ الاستلام"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-gray-200 px-2 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-xs disabled:opacity-50"
            >
              {loadingSubmit ? "جاري الحفظ..." : "حفظ الدفعة"}
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
            title="بحث في الدفعات"
            aria-label="بحث في الدفعات"
            placeholder="ابحث باسم العميل، نوع الدفعة، أو وسيلة الدفع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
              <tr>
                <th className="px-5 py-3.5">التاريخ</th>
                <th className="px-5 py-3.5">المشروع/العميل</th>
                <th className="px-5 py-3.5">نوع الدفعة</th>
                <th className="px-5 py-3.5">وسيلة الدفع</th>
                <th className="px-5 py-3.5">المبلغ</th>
                <th className="px-5 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 font-bold">
                    جاري تحميل سجل الدفعات...
                  </td>
                </tr>
              ) : filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-bold">
                    {formatDate(p.paymentDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/projects/${p.projectId}`} className="font-extrabold text-primary-700 hover:underline">
                      {p.projectName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    {p.reason}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {p.paymentMethod}
                  </td>
                  <td className="px-5 py-3.5 font-extrabold text-emerald-600">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/projects/${p.projectId}`}
                        title="عرض تفاصيل المشروع"
                        className="bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white p-1.5 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => deletePayment(p.projectId, p.id)}
                        title="حذف الدفعة"
                        aria-label="حذف الدفعة"
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 font-bold text-sm">
                    {payments.length === 0
                      ? "لا توجد دفعات مسجلة للعملاء حتى الآن."
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
