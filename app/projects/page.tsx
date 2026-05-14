"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Eye, Trash2, Search, Briefcase, Filter } from "lucide-react";

const STATUSES = ["الكل", "جديد", "قيد التنفيذ", "منتهي", "ملغي"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/projects");
    if (res.ok) {
      setProjects(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteProject(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع بالكامل؟ سيتم حذف جميع الغرف، المصاريف، والدفعات المرتبطة به نهائياً.")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
  }

  const statusBadgeColor: Record<string, string> = {
    "جديد": "bg-blue-50 text-blue-700 border-blue-200",
    "قيد التنفيذ": "bg-amber-50 text-amber-700 border-amber-200",
    "منتهي": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "ملغي": "bg-rose-50 text-rose-700 border-rose-200",
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          p.projectType.includes(search) ||
                          (p.phone && p.phone.includes(search));
    const matchesStatus = statusFilter === "الكل" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-primary-600" size={24} />
            سجل المشاريع والعملاء
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            أضف اتفاقات جديدة، وتابع التكلفة والحالة لكل مشروع مع سهولة البحث والتصفية.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow"
        >
          <Plus size={18} />
          {showForm ? "إخفاء النموذج" : "مشروع جديد"}
        </button>
      </div>

      {/* New Project Form */}
      {showForm && (
        <div className="animate-fade-in">
          <ProjectForm onSuccess={() => { setShowForm(false); load(); }} />
        </div>
      )}

      {/* Search & Filter controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ابحث باسم العميل، نوع المشروع، أو رقم الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-400 px-2 flex items-center gap-1">
              <Filter size={14} /> الحالة:
            </span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-primary-900 text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Table / Cards list */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 text-xs">
              <tr>
                <th className="px-5 py-3.5">العميل</th>
                <th className="px-5 py-3.5">النوع</th>
                <th className="px-5 py-3.5">التكلفة النهائية</th>
                <th className="px-5 py-3.5">الحالة</th>
                <th className="px-5 py-3.5">تاريخ البدء</th>
                <th className="px-5 py-3.5 text-center">إحصائيات الصرف</th>
                <th className="px-5 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 font-bold">
                    جاري تحميل المشاريع...
                  </td>
                </tr>
              ) : filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="font-extrabold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {p.clientName}
                    </div>
                    {p.phone && <div className="text-xs text-gray-400 mt-0.5 font-sans" dir="ltr">{p.phone}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      {p.projectType}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-gray-900">
                    {formatCurrency(p.finalCost)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadgeColor[p.status] || "bg-gray-50 text-gray-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-400">
                    {p.startDate ? formatDate(p.startDate) : "-"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-500 font-bold">
                      <span title="عدد الأقسام">🏠 {p._count?.rooms || 0}</span>
                      <span title="حركات الصرف">💸 {p._count?.expenses || 0}</span>
                      <span title="الدفعات المستلمة">💰 {p._count?.payments || 0}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/projects/${p.id}`}
                        className="bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all shadow-2xs flex items-center gap-1"
                      >
                        <Eye size={14} /> فتح
                      </Link>
                      <button
                        onClick={() => deleteProject(p.id)}
                        title="حذف المشروع بالكامل"
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 font-bold text-sm">
                    {projects.length === 0 ? "لا يوجد مشاريع مسجلة حالياً. انقر على 'مشروع جديد' للبدء." : "لا توجد نتائج مطابقة لبحثك."}
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
