import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  type?: "currency" | "number";
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "red" | "yellow" | "gray" | "purple";
}

const borderMap: Record<string, string> = {
  blue: "hover:border-primary-300",
  green: "hover:border-emerald-300",
  red: "hover:border-rose-300",
  yellow: "hover:border-amber-300",
  purple: "hover:border-purple-300",
  gray: "hover:border-gray-300",
};

const sideStripMap: Record<string, string> = {
  blue: "bg-primary-500",
  green: "bg-emerald-500",
  red: "bg-rose-500",
  yellow: "bg-amber-500",
  purple: "bg-purple-500",
  gray: "bg-gray-400",
};

const iconBgMap: Record<string, string> = {
  blue: "bg-primary-50 text-primary-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-rose-50 text-rose-600",
  yellow: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
  gray: "bg-gray-50 text-gray-600",
};

export default function StatCard({ title, value, type = "currency", trend = "neutral", color = "blue" }: StatCardProps) {
  const display = type === "currency" ? formatCurrency(value) : new Intl.NumberFormat("ar-EG").format(value);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-xs transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 relative overflow-hidden ${borderMap[color]}`}>
      {/* Decorative subtle side border */}
      <div className={`absolute top-0 right-0 w-1 h-full ${sideStripMap[color]}`} />
      
      <div className="flex items-center justify-between mr-2">
        <h3 className="text-xs font-bold text-gray-500 tracking-wide">{title}</h3>
        <div className={`p-2 rounded-xl transition-colors ${iconBgMap[color]}`}>
          <TrendIcon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-extrabold mt-3 tracking-tight text-gray-900 mr-2">{display}</p>
    </div>
  );
}
