"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((projects) => {
        Promise.all(projects.map((p: any) => fetch(`/api/projects/${p.id}`).then((r) => r.json()))).then((fullProjects) => {
          const all: any[] = [];
          fullProjects.forEach((fp) => {
            fp.payments.forEach((pay: any) => {
              all.push({ ...pay, projectName: fp.clientName, projectId: fp.id });
            });
          });
          setPayments(all.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">💰 سجل دفعات العملاء</h1>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">المشروع</th>
                <th className="px-4 py-3">السبب</th>
                <th className="px-4 py-3">الطريقة</th>
                <th className="px-4 py-3">المبلغ</th>
                <th className="px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3 font-medium">{p.projectName}</td>
                  <td className="px-4 py-3">{p.reason}</td>
                  <td className="px-4 py-3">{p.paymentMethod}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/projects/${p.projectId}`} className="text-primary-600 hover:text-primary-800">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا يوجد دفعات مسجلة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
