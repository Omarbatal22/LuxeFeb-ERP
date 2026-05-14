import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  type?: "currency" | "number";
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "red" | "yellow" | "gray";
}

const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  green: "bg-emerald-50 border-emerald-200 text-emerald-900",
  red: "bg-red-50 border-red-200 text-red-900",
  yellow: "bg-amber-50 border-amber-200 text-amber-900",
  gray: "bg-gray-50 border-gray-200 text-gray-900",
};

export default function StatCard({ title, value, type = "currency", trend = "neutral", color = "blue" }: StatCardProps) {
  const display = type === "currency" ? formatCurrency(value) : new Intl.NumberFormat("ar-EG").format(value);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold opacity-80">{title}</h3>
        <TrendIcon size={20} className="opacity-60" />
      </div>
      <p className="text-2xl font-bold mt-2">{display}</p>
    </div>
  );
}
