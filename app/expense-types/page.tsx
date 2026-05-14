"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Layers } from "lucide-react";

const CATEGORIES = ["خامات", "عمالة", "خدمات خارجية", "نقل", "إدارية"];

const categoryColors: Record<string, string> = {
  "خامات": "bg-blue-50 text-blue-700 border-blue-200",
  "عمالة": "bg-amber-50 text-amber-700 border-amber-200",
  "خدمات خارجية": "bg-purple-50 text-purple-700 border-purple-200",
  "نقل": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "إدارية": "bg-rose-50 text-rose-700 border-rose-200",
};

export default function ExpenseTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("الكل");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/expense-types");
    setTypes(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const category = form.get("category") as string;

    if (!name || !category) return;

    await fetch("/api/expense-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category }),
    });

    setLoading(false);
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function deleteType(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا البند؟")) return;
    setErrorMsg(null);
    const res = await fetch(`/api/expense-types/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(data.error || "حدث خطأ أثناء الحذف.");
    } else {
      load();
    }
  }

  const filteredTypes = filter === "الكل" ? types : types.filter((t) => t.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-primary-600" size={24} />
            إدارة أنواع المصاريف (البنود)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            أضف أو احذف تصنيفات وبنود الصرف لاستخدامها لاحقاً في تسجيل مصاريف المشاريع.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium animate-fade-in">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
          <Plus className="text-primary-600" size={20} />
          إضافة بند صرف جديد
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم البند *</label>
            <input
              name="name"
              required
              placeholder="مثال: خشب زان، دهانات، نجار..."
              className="w-full rounded-xl border-gray-200 border px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1.5">التصنيف الأساسي *</label>
            <select
              id="category-select"
              name="category"
              title="التصنيف الأساسي"
              aria-label="التصنيف الأساسي"
              required
              className="w-full rounded-xl border-gray-200 border px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2 h-[46px]"
          >
            {loading ? "جاري الإضافة..." : "حفظ البند"}
          </button>
        </div>
      </form>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-2xs">
        <span className="text-xs font-bold text-gray-400 px-3 flex items-center gap-1">
          <Layers size={14} /> تصفية:
        </span>
        {["الكل", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === cat
                ? "bg-primary-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between hover:border-primary-200 transition-all group"
          >
            <div className="space-y-1.5">
              <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                {t.name}
              </p>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  categoryColors[t.category] || "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {t.category}
              </span>
            </div>
            <button
              onClick={() => deleteType(t.id)}
              title="حذف البند"
              className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {filteredTypes.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 py-12 text-center text-gray-400 text-sm">
            لا توجد بنود مسجلة في هذا التصنيف حالياً.
          </div>
        )}
      </div>
    </div>
  );
}
