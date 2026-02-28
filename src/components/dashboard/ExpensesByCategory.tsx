import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface CategoryExpense {
  id: string;
  name: string;
  icon: React.ReactNode;
  amount: number;
  percentage: number;
  color: string;
}

interface ExpensesByCategoryProps {
  categories: CategoryExpense[];
  total: number;
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
}

export function ExpensesByCategory({ categories, total, onCategoryClick }: ExpensesByCategoryProps) {
  const [showAll, setShowAll] = useState(false);
  const topCategories = !showAll ? categories.slice(0, 5) : categories;
  const hasMore = categories.length > 5;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-[13px] text-slate-800 tracking-tight">Despesas por Categoria</h3>
        <div className="text-[10px] font-bold text-slate-400 uppercase">
          Total: <span className="text-slate-600 font-black">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
        {categories.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">Sem despesas registradas.</div>
        ) : (
          topCategories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "group px-2 py-1.5 rounded-xl transition-all",
                onCategoryClick && "cursor-pointer hover:bg-slate-50/80"
              )}
              onClick={() => onCategoryClick?.(category.id, category.name)}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/5 transition-colors">
                    <span className="text-xs">{category.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-700 tracking-tight capitalize leading-tight">{category.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-black text-slate-800 tracking-tighter">{formatCurrency(category.amount)}</span>
                  <span className="text-[9px] font-black text-[#2D9B73]/80 w-8 text-right">
                    {(category.percentage || 0).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-[3px] bg-slate-50 rounded-full overflow-hidden w-full">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: "#2D9B73",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2D9B73] transition-colors border-t border-slate-50 pt-2"
        >
          {showAll ? "Ver Menos" : `Ver mais (${categories.length - 5} categorias)`}
        </button>
      )}
    </div>
  );
}
