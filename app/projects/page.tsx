"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Eye, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function deleteProject(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
  }

  const statusColor: Record<string, string> = {
    "جديد": "bg-blue-100 text-blue-800",
    "قيد التنفيذ": "bg-yellow-100 text-yellow-800",
    "منتهي": "bg-green-100 text-green-800",
    "ملغي": "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📁 المشاريع</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          مشروع جديد
        </button>
      </div>

      {showForm && <ProjectForm onSuccess={() => { setShowForm(false); load(); }} />}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">التكلفة النهائية</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">تاريخ البدء</th>
                <th className="px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.clientName}</td>
                  <td className="px-4 py-3 text-gray-600">{p.projectType}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(p.finalCost)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.status] || "bg-gray-100"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.startDate ? formatDate(p.startDate) : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${p.id}`} className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50">
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => deleteProject(p.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا يوجد مشاريع حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
