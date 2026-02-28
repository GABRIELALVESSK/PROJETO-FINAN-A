import { cn } from "@/lib/utils";
import { ArrowRight, Repeat } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  icon: React.ReactNode;
  dateFormatted?: string;
  is_recurring?: boolean;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  totalCount: number;
  onViewAll?: () => void;
  onEdit?: (transaction: any) => void;
}

export function RecentTransactions({ transactions, totalCount, onViewAll, onEdit }: RecentTransactionsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(val));
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-slate-800 tracking-tight text-[15px]">Transações Recentes</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {totalCount} transações
        </span>
      </div>

      <div className="space-y-6">
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">Nenhuma transação recente.</div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-1 group cursor-pointer"
              onClick={onEdit ? () => onEdit(transaction) : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                  <div className="scale-110">
                    {transaction.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-700 tracking-tight">{transaction.description}</p>
                    {transaction.is_recurring && <Repeat className="w-3 h-3 text-slate-300" />}
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{transaction.dateFormatted || transaction.date}</p>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-black tracking-tight",
                  transaction.type === "income" ? "text-[#2D9B73]" : "text-[#D94E38]"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onViewAll}
        className="flex items-center justify-center gap-2 w-full mt-8 py-3.5 text-[11px] font-black text-emerald-600 bg-emerald-50/30 rounded-xl hover:bg-emerald-50 transition-all uppercase tracking-widest"
      >
        Ver extrato completo
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
