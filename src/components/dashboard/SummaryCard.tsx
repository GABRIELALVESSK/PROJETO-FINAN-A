import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  type: "neutral" | "income" | "expense" | "balance";
  icon?: LucideIcon;
}

export function SummaryCard({ title, value, subtitle, type, icon: Icon }: SummaryCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const getStyles = () => {
    // Determine if we should use negative colors for balance
    const isNegativeBalance = type === "balance" && value < 0;

    if (isNegativeBalance || type === "expense") {
      return {
        bg: "bg-[#FCF0ED] border-[#F9E2DB]",
        text: "text-[#D94E38]",
        iconBg: "bg-[#F9E2DB]",
        IconComponent: TrendingDown,
      };
    }

    switch (type) {
      case "income":
        return {
          bg: "bg-[#EAF9F5] border-[#D1F2E9]",
          text: "text-[#2D9B73]",
          iconBg: "bg-[#D1F2E9]",
          IconComponent: TrendingUp,
        };
      case "balance":
        return {
          bg: "bg-[#E7F6F2] border-[#D1EBE5]",
          text: "text-[#2D9B73]",
          iconBg: "bg-[#D1EBE5]",
          IconComponent: Wallet,
        };
      default:
        return {
          bg: "bg-[#F4F7F6] border-[#E2E8E6]",
          text: "text-[#2D9B73]",
          iconBg: "bg-[#E2E8E6]",
          IconComponent: ArrowRight,
        };
    }
  };

  const styles = getStyles();
  const CardIcon = Icon || styles.IconComponent;

  return (
    <div className={cn("rounded-2xl border p-4 relative overflow-hidden transition-all", styles.bg)}>
      <div className="flex items-center justify-between">
        <div className="z-10">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 font-sans uppercase tracking-[0.05em]">{title}</span>
            <div className="w-3 h-3 rounded-full border border-slate-200 flex items-center justify-center text-[7px] text-slate-300 font-bold cursor-help">i</div>
          </div>
          <p className={cn("text-xl font-black tracking-tight leading-tight", styles.text)}>
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{subtitle}</p>
          )}
        </div>

        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-transform",
          styles.iconBg
        )}>
          <CardIcon className={cn("w-4.5 h-4.5", styles.text)} />
        </div>
      </div>
    </div>
  );
}
