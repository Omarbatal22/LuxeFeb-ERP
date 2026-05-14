"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((projects) => {
        const all: any[] = [];
        projects.forEach((p: any) => {
          // We need to fetch full project to get expenses with relations
        });
        // Better: fetch all expenses via a dedicated endpoint or iterate
        // For simplicity, we'll fetch each project
        Promise.all(projects.map((p: any) => fetch(`/api/projects/${p.id}`).then((r) => r.json()))).then((fullProjects) => {
          fullProjects.forEach((fp) => {
            fp.expenses.forEach((ex: any) => {
              all.push({ ...ex, projectName: fp.clientName, projectId: fp.id });
            });
          });
          setExpenses(all.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()));
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">💸 سجل المصاريف</h1>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">المشروع</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">المورد</th>
                <th className="px-4 py-3">الوصف</th>
                <th className="px-4 py-3">المبلغ</th>
                <th className="px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{formatDate(ex.expenseDate)}</td>
                  <td className="px-4 py-3 font-medium">{ex.projectName}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100">{ex.expenseType?.name}</span></td>
                  <td className="px-4 py-3">{ex.vendorName || "-"}</td>
                  <td className="px-4 py-3">{ex.description}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(ex.amount)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/projects/${ex.projectId}`} className="text-primary-600 hover:text-primary-800">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">لا يوجد مصاريف مسجلة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
