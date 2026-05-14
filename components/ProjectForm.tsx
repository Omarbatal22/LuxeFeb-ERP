"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      clientName: form.get("clientName"),
      phone: form.get("phone"),
      address: form.get("address"),
      projectType: form.get("projectType"),
      initialCost: Number(form.get("initialCost")),
      status: form.get("status"),
      startDate: form.get("startDate"),
      deliveryDate: form.get("deliveryDate"),
      notes: form.get("notes"),
    };

    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    (e.target as HTMLFormElement).reset();
    onSuccess?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">➕ مشروع جديد</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل *</label>
          <input name="clientName" required className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">التليفون</label>
          <input name="phone" className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
          <input name="address" className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوع المشروع *</label>
          <select name="projectType" required className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="شقة">شقة</option>
            <option value="شركة">شركة</option>
            <option value="فيلا">فيلا</option>
            <option value="محل">محل</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة الابتدائية *</label>
          <input name="initialCost" type="number" required min="0" className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
          <select name="status" className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="جديد">جديد</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
            <option value="منتهي">منتهي</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
          <input name="startDate" type="date" className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسليم</label>
          <input name="deliveryDate" type="date" className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
        <textarea name="notes" rows={3} className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "جاري الحفظ..." : "حفظ المشروع"}
      </button>
    </form>
  );
}
