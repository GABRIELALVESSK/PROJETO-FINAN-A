import { useState, useEffect, useMemo } from "react";
import { Calendar, Repeat, Trash2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabaseData, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { useDate } from "@/contexts/DateContext";
import { format as formatDate } from "date-fns";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: {
    id?: string;
    type: "income" | "expense" | "transfer";
    description: string;
    amount: number;
    category: string;
    date: string;
    responsible?: string;
    account_id?: string;
    is_recurring?: boolean;
    isRecurring?: boolean;
    frequency?: string;
    repeat_until?: string;
    isInvestment?: boolean;
    isOccurrence?: boolean;
    status?: string;
  };
}

const categories = [
  // Income
  { id: "salario", name: "Salário Líquido", icon: "💰", type: "income" },
  { id: "vale-refeicao", name: "Vale Refeição", icon: "🍱", type: "income" },
  { id: "vale-alimentacao", name: "Vale Alimentação", icon: "🛒", type: "income" },
  { id: "bonus", name: "Bônus/PLR", icon: "🎁", type: "income" },
  { id: "ferias", name: "Férias", icon: "🏖️", type: "income" },
  { id: "decimo-terceiro", name: "13º Salário", icon: "🎄", type: "income" },
  { id: "servicos-prestados", name: "Serviços Prestados", icon: "💼", type: "income" },
  { id: "projeto", name: "Projeto/Freela", icon: "📊", type: "income" },
  { id: "consultoria", name: "Consultoria", icon: "🎯", type: "income" },
  { id: "venda-produto", name: "Venda de Produto", icon: "🛍️", type: "income" },
  { id: "comissao", name: "Comissão", icon: "💸", type: "income" },
  { id: "aluguel-receita", name: "Aluguel/Locação", icon: "🏠", type: "income" },
  { id: "dividendos", name: "Dividendos/Lucros", icon: "📈", type: "income" },
  { id: "outros-receitas", name: "Outros", icon: "📦", type: "income" },

  // Expense
  { id: "investimentos", name: "Investimentos", icon: "📈", type: "expense" },
  { id: "moradia", name: "Moradia", icon: "🏠", type: "expense" },
  { id: "alimentacao", name: "Alimentação", icon: "🍔", type: "expense" },
  { id: "transporte", name: "Transporte", icon: "🚗", type: "expense" },
  { id: "saude", name: "Saúde", icon: "💊", type: "expense" },
  { id: "educacao", name: "Educação", icon: "📚", type: "expense" },
  { id: "lazer", name: "Lazer", icon: "🎮", type: "expense" },
  { id: "vestuario", name: "Vestuário", icon: "👕", type: "expense" },
  { id: "compras", name: "Compras", icon: "🛍️", type: "expense" },
  { id: "servicos", name: "Serviços", icon: "💡", type: "expense" },
  { id: "assinaturas", name: "Assinaturas", icon: "📱", type: "expense" },
  { id: "impostos", name: "Impostos", icon: "📋", type: "expense" },
  { id: "doacoes", name: "Doações e Ofertas", icon: "🤝", type: "expense" },
  { id: "pet", name: "Pet", icon: "🐶", type: "expense" },
  { id: "viagens", name: "Viagens", icon: "✈️", type: "expense" },
  { id: "beleza", name: "Beleza e Cuidados", icon: "💅", type: "expense" },
  { id: "streaming", name: "Streaming/Apps", icon: "📺", type: "expense" },
  { id: "dividas", name: "Dívidas", icon: "📋", type: "expense" },
  { id: "outros-despesas", name: "Outros", icon: "📦", type: "expense" },
  // Transfer
  { id: "transferencia", name: "Transferência Interna", icon: "🔄", type: "transfer" },
];

export function TransactionModal({ open, onOpenChange, transaction }: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense" | "transfer">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [responsible, setResponsible] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("mensal");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { selectedDate } = useDate();

  const { data: accountsData } = useSupabaseData("accounts");
  const accounts = (accountsData as any[]) || [];

  const { data: customCategoriesData } = useSupabaseData("categories");
  const customCategories = (customCategoriesData as any[]) || [];

  const insertTransaction = useSupabaseInsert("transactions");
  const updateTransaction = useSupabaseUpdate("transactions");
  const deleteTransaction = useSupabaseDelete("transactions");

  const updateInvestment = useSupabaseUpdate("investments");
  const deleteInvestment = useSupabaseDelete("investments");

  // Merge default categories with custom ones from DB
  const allCategories = useMemo(() => {
    const combined = [...categories];

    customCategories.forEach(custom => {
      // Avoid duplicates if already in list by name/id
      const exists = combined.some(c =>
        c.name.toLowerCase() === (custom.nome?.toLowerCase() || "") &&
        c.type === (custom.tipo === "receitas" ? "income" : "expense")
      );

      if (!exists) {
        combined.push({
          id: custom.id,
          name: custom.nome,
          icon: custom.icone,
          type: custom.tipo === "receitas" ? "income" : "expense"
        });
      }
    });

    return combined;
  }, [customCategories]);

  useEffect(() => {
    if (open) {
      if (transaction) {
        setType(transaction.type);
        setDescription(transaction.description);
        setAmount(transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
        setCategory(transaction.category);
        // Ensure date is only YYYY-MM-DD part for the native input
        const rawDate = transaction.date ? String(transaction.date).split("T")[0] : "";
        setDate(rawDate);
        setResponsible(transaction.responsible || "");
        setAccountId(transaction.account_id || "");
        setIsRecurring(transaction.is_recurring || transaction.isRecurring || false);
        setFrequency(transaction.frequency || "mensal");
        setRepeatUntil(transaction.repeat_until || "");
        setIsPending(transaction.status === "pendentes");
      } else {
        setType("expense");
        setDescription("");
        setAmount("");
        setCategory("");
        const today = new Date();
        const isCurrentMonth =
          today.getMonth() === selectedDate.getMonth() &&
          today.getFullYear() === selectedDate.getFullYear();
        const defaultDate = isCurrentMonth ? today : selectedDate;
        setDate(formatDate(defaultDate, "yyyy-MM-dd"));
        setResponsible("");
        setAccountId("");
        setIsRecurring(false);
        setFrequency("mensal");
        setRepeatUntil("");
        setIsPending(false);
      }
    }
  }, [open, transaction]);

  const handleTypeChange = (newType: "income" | "expense" | "transfer") => {
    setType(newType);
    setCategory("");
  };

  const parseAmount = (val: string) => {
    if (!val) return 0;
    const normalized = val.replace(/\./g, "").replace(",", ".");
    return parseFloat(normalized);
  };

  const handleSave = async () => {
    if (!description || !amount || !category || !date) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const numericAmount = parseAmount(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }

    const isInvestment = (transaction as any)?.isInvestment;
    const isOccurrence = (transaction as any)?.isOccurrence;

    // Correct payload keys for investments vs transactions
    const payload: any = {
      description,
      [isInvestment ? "value" : "amount"]: numericAmount,
      category,
      date,
      type,
      responsible,
      is_recurring: isRecurring,
    };

    if (!isInvestment) {
      payload.status = isPending ? "pendentes" : "realizadas";
    }

    if (accountId && accountId !== "none") {
      payload.account_id = accountId;
    } else {
      payload.account_id = null;
    }
    if (isRecurring) {
      payload.frequency = frequency;
      payload.repeat_until = repeatUntil || null;
    } else {
      payload.frequency = null;
      payload.repeat_until = null;
    }

    try {
      if (transaction?.id) {
        // Handle virtual IDs for weekly occurrences (ID-TIMESTAMP)
        let actualId = transaction.id;
        if (isOccurrence && String(actualId).includes("-")) {
          actualId = String(actualId).split("-")[0];
        }

        if (isInvestment) {
          await updateInvestment.mutateAsync({ id: actualId, updates: payload });
        } else {
          await updateTransaction.mutateAsync({ id: actualId, updates: payload });
        }
        toast.success("Transação atualizada!");
      } else {
        await insertTransaction.mutateAsync(payload);
        toast.success("Transação adicionada!");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Erro: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleDelete = async () => {
    if (!transaction?.id) return;
    if (confirm("Excluir esta transação?")) {
      try {
        const isInvestment = (transaction as any)?.isInvestment;
        const isOccurrence = (transaction as any)?.isOccurrence;
        let actualId = transaction.id;
        if (isOccurrence && String(actualId).includes("-")) {
          actualId = String(actualId).split("-")[0];
        }

        if (isInvestment) {
          await deleteInvestment.mutateAsync(actualId);
        } else {
          await deleteTransaction.mutateAsync(actualId);
        }
        toast.success("Transação excluída!");
        onOpenChange(false);
      } catch {
        toast.error("Erro ao excluir.");
      }
    }
  };

  const selectedCategory = allCategories.find(c => c.id === category || c.name === category);
  const isEditing = !!transaction?.id;
  const submitLabel = type === "income" ? "Adicionar Receita" : type === "transfer" ? "Adicionar Transferência" : "Adicionar Despesa";
  const submitBg =
    type === "income"
      ? "bg-[#2D9B73] hover:bg-[#258563]"
      : type === "transfer"
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-[#D94E38] hover:bg-[#c44531]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 bg-white border-none shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <DialogTitle className="text-base font-bold text-slate-800">
            {isEditing ? "Editar Transação" : "Adicionar Transação"}
          </DialogTitle>
        </div>

        {/* Type Toggle */}
        <div className="px-6 pb-2">
          <div className="h-10 rounded-xl bg-slate-100 p-1 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={cn(
                "h-full rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                type === "income"
                  ? "bg-white text-[#2D9B73] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={cn(
                "h-full rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                type === "expense"
                  ? "bg-[#FFF0EE] text-[#D94E38] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("transfer")}
              className={cn(
                "h-full rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                type === "transfer"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              🔄
              Transfer.
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-6 space-y-3.5 overflow-y-auto max-h-[65vh]">
          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500" htmlFor="desc">
              Descrição <span className="text-red-400">*</span>
            </Label>
            <Input
              id="desc"
              placeholder="Ex: Salário, Aluguel..."
              className="h-9 text-sm rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-slate-300 text-slate-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500" htmlFor="amount">
              Valor (R$) <span className="text-red-400">*</span>
            </Label>
            <Input
              id="amount"
              placeholder="0,00"
              className="h-9 text-sm rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-slate-300 text-slate-700"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500">
              Categoria <span className="text-red-400">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary text-slate-700 data-[placeholder]:text-slate-300">
                <SelectValue placeholder="Selecione uma categoria">
                  {selectedCategory && (
                    <span className="flex items-center gap-1.5">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.name}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                {allCategories
                  .filter(c => c.type === type)
                  .map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="rounded-lg text-sm py-2 px-3 cursor-pointer font-medium text-slate-600 focus:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500">Data</Label>
            <div className="relative">
              <Input
                type="date"
                className="h-9 text-sm rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-slate-700 appearance-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Recurring */}
          <div className={cn(
            "rounded-xl border p-3.5 space-y-3 transition-colors",
            isRecurring ? "border-emerald-200 bg-emerald-50/40" : "border-slate-100 bg-slate-50/60"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Repeat className={cn("w-3.5 h-3.5", isRecurring ? "text-emerald-500" : "text-slate-400")} />
                <div>
                  <p className="text-xs font-bold text-slate-700">Transação recorrente</p>
                  <p className="text-[10px] text-slate-400">Lança automaticamente na frequência escolhida</p>
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                className="data-[state=checked]:bg-[#2D9B73] scale-90"
              />
            </div>

            {isRecurring && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Frequência</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="h-8 text-xs rounded-lg bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                      <SelectItem value="mensal" className="text-sm py-1.5 px-3 rounded-lg">Mensal</SelectItem>
                      <SelectItem value="semanal" className="text-sm py-1.5 px-3 rounded-lg">Semanal</SelectItem>
                      <SelectItem value="anual" className="text-sm py-1.5 px-3 rounded-lg">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Repetir até (opcional)</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-primary text-slate-700 appearance-none"
                    value={repeatUntil}
                    onChange={(e) => setRepeatUntil(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400">Deixe em branco para repetir indefinidamente</p>
                </div>
              </div>
            )}
          </div>

          {/* Linked Account */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500">
              Conta vinculada
            </Label>
            <Select value={accountId || "none"} onValueChange={setAccountId}>
              <SelectTrigger className="h-10 text-sm rounded-lg border-[#2D9B73] focus:ring-1 focus:ring-[#2D9B73] text-slate-700">
                <SelectValue placeholder="Nenhuma conta" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                <SelectItem value="none" className="rounded-lg text-sm py-2 px-3 cursor-pointer font-medium text-slate-600 focus:bg-slate-50">
                  Nenhuma conta
                </SelectItem>
                {accounts.map((acc) => (
                  <SelectItem
                    key={acc.id}
                    value={acc.id}
                    className="rounded-lg text-sm py-2 px-3 cursor-pointer font-medium text-slate-600 focus:bg-slate-50"
                  >
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="pt-1 space-y-2">
            <Button
              className={cn(
                "w-full h-10 rounded-xl text-sm font-bold text-white transition-all",
                submitBg
              )}
              onClick={handleSave}
              disabled={insertTransaction.isPending || updateTransaction.isPending}
            >
              {insertTransaction.isPending || updateTransaction.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEditing ? "Salvar Alterações" : submitLabel}
            </Button>

            {isEditing && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-9 rounded-xl border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  className="h-9 rounded-xl border-red-100 text-[#D94E38] text-xs font-bold hover:bg-red-50 gap-1.5"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </Button>
              </div>
            )}

            {!isEditing && (
              <Button
                variant="ghost"
                className="w-full h-8 text-xs text-slate-400 font-semibold hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
