"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-5 bg-gradient-to-br from-white to-gray-50/50 p-6 sm:p-8 rounded-3xl border border-primary-100 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 left-0 w-24 h-24 bg-primary-50 rounded-br-full -z-10" />
      
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <PlusCircle className="text-primary-600" size={22} />
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">إضافة اتفاق مشروع جديد</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="clientName" className="block text-xs font-bold text-gray-700 mb-1.5">اسم العميل *</label>
          <input
            id="clientName"
            name="clientName"
            title="اسم العميل"
            aria-label="اسم العميل"
            required
            placeholder="الاسم الثلاثي أو الشهرة"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
          <input
            id="phone"
            name="phone"
            title="رقم الهاتف"
            aria-label="رقم الهاتف"
            placeholder="01xxxxxxxxx"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white font-sans text-left"
            dir="ltr"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-xs font-bold text-gray-700 mb-1.5">العنوان</label>
          <input
            id="address"
            name="address"
            title="العنوان"
            aria-label="العنوان"
            placeholder="المنطقة أو الشارع"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          />
        </div>
        <div>
          <label htmlFor="projectType" className="block text-xs font-bold text-gray-700 mb-1.5">نوع المشروع *</label>
          <select
            id="projectType"
            name="projectType"
            title="نوع المشروع"
            aria-label="نوع المشروع"
            required
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-extrabold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          >
            <option value="شقة">شقة</option>
            <option value="شركة">شركة</option>
            <option value="فيلا">فيلا</option>
            <option value="محل">محل</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
        <div>
          <label htmlFor="initialCost" className="block text-xs font-bold text-gray-700 mb-1.5">التكلفة الابتدائية المتفق عليها *</label>
          <input
            id="initialCost"
            name="initialCost"
            title="التكلفة الابتدائية"
            aria-label="التكلفة الابتدائية"
            type="number"
            required
            min="0"
            placeholder="جنيه مصري"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-extrabold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-bold text-gray-700 mb-1.5">الحالة المبدئية</label>
          <select
            id="status"
            name="status"
            title="الحالة المبدئية"
            aria-label="الحالة المبدئية"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-extrabold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          >
            <option value="جديد">جديد</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
            <option value="منتهي">منتهي</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
        <div>
          <label htmlFor="startDate" className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ البدء</label>
          <input
            id="startDate"
            name="startDate"
            title="تاريخ البدء"
            aria-label="تاريخ البدء"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          />
        </div>
        <div>
          <label htmlFor="deliveryDate" className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ التسليم المتوقع</label>
          <input
            id="deliveryDate"
            name="deliveryDate"
            title="تاريخ التسليم المتوقع"
            aria-label="تاريخ التسليم المتوقع"
            type="date"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-xs font-bold text-gray-700 mb-1.5">ملاحظات وشروط إضافية</label>
        <textarea
          id="notes"
          name="notes"
          title="ملاحظات وشروط إضافية"
          aria-label="ملاحظات وشروط إضافية"
          rows={3}
          placeholder="أي تفاصيل خاصة بطريقة الدفع أو مواصفات الأخشاب والدهان..."
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            إلغاء
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs hover:shadow disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "حفظ الاتفاق وبدء المشروع"}
        </button>
      </div>
    </form>
  );
}
