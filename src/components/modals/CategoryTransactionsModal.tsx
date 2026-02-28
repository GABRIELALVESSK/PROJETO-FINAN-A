import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TransactionItem {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: string;
    icon?: React.ReactNode;
}

interface CategoryTransactionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryName: string;
    categoryIcon?: string;
    type: "income" | "expense";
    transactions: TransactionItem[];
    total: number;
}

export function CategoryTransactionsModal({
    open,
    onOpenChange,
    categoryName,
    categoryIcon,
    type,
    transactions,
    total,
}: CategoryTransactionsModalProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

    const isIncome = type === "income";
    const colorClass = isIncome ? "text-[#2D9B73]" : "text-[#D94E38]";
    const bgClass = isIncome ? "bg-emerald-50" : "bg-red-50";
    const IconComponent = isIncome ? TrendingUp : TrendingDown;

    const sorted = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 bg-white border-none shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className={cn("px-6 pt-5 pb-4 border-b border-slate-100", bgClass)}>
                    <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <IconComponent className={cn("w-4 h-4", colorClass)} />
                        {categoryIcon && <span className="text-lg">{categoryIcon}</span>}
                        <span>{categoryName}</span>
                    </DialogTitle>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500 font-semibold">
                            {sorted.length} transaç{sorted.length === 1 ? "ão" : "ões"}
                        </p>
                        <p className={cn("text-lg font-black", colorClass)}>
                            {formatCurrency(total)}
                        </p>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                    {sorted.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            Nenhuma transação encontrada.
                        </div>
                    ) : (
                        sorted.map((tx, i) => (
                            <div
                                key={tx.id || i}
                                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">
                                        {tx.description}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                        {(() => {
                                            try {
                                                return format(new Date(tx.date + "T00:00:00"), "dd 'de' MMMM", { locale: ptBR });
                                            } catch {
                                                return tx.date;
                                            }
                                        })()}
                                    </p>
                                </div>
                                <span className={cn(
                                    "text-sm font-bold whitespace-nowrap ml-4",
                                    isIncome ? "text-[#2D9B73]" : "text-[#D94E38]"
                                )}>
                                    {isIncome ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total da Categoria
                    </span>
                    <span className={cn("text-sm font-black", colorClass)}>
                        {formatCurrency(total)}
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
