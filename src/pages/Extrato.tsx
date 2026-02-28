import { useState, useMemo } from "react";
import { Plus, Home, Coins, Users, Filter, Search, Pencil, X, AlertTriangle, Trash2, Loader2, Calendar, TrendingUp, TrendingDown, Repeat, CheckCircle2, Circle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSupabaseData, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { useDate } from "@/contexts/DateContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: any;
  type: "income" | "expense" | "transfer";
  responsible?: string;
  status: "realizadas" | "pendentes";
  is_recurring?: boolean;
  frequency?: string;
  repeat_until?: string;
}

const categories = [
  // Income
  { id: "salario", name: "Salário Líquido", icon: "💰", type: "income" },
  { id: "vale-refeicao", name: "Vale Refeição", icon: "🍱", type: "income" },
  { id: "vale-alimentacao", name: "Vale Alimentação", icon: "🛒", type: "income" },
  { id: "bonus", name: "Bônus/PLR", icon: "🎁", type: "income" },
  { id: "ferias", name: "Férias", icon: "🏖️", type: "income" },
  { id: "decimo-terceiro", name: "13º Salário", icon: "🎄", type: "income" },
  { id: "servicos", name: "Serviços Prestados", icon: "💼", type: "income" },
  { id: "projeto", name: "Projeto/Freela", icon: "📊", type: "income" },
  { id: "consultoria", name: "Consultoria", icon: "🎯", type: "income" },
  { id: "venda", name: "Venda de Produto", icon: "🛍️", type: "income" },
  { id: "comissao", name: "Comissão", icon: "💸", type: "income" },
  { id: "aluguel", name: "Aluguel/Locação", icon: "🏠", type: "income" },
  { id: "dividendos", name: "Dividendos/Lucros", icon: "📈", type: "income" },
  { id: "outros", name: "Outros", icon: "📦", type: "income" },

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

const BulkEditModal = ({
  open,
  onOpenChange,
  selectedCount,
  onApply,
  allCategories
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (data: any) => Promise<void>;
  allCategories: any[];
}) => {
  const [editDate, setEditDate] = useState(false);
  const [editCategory, setEditCategory] = useState(false);
  const [editAmount, setEditAmount] = useState(false);
  const [editAccount, setEditAccount] = useState(false);

  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");

  const { data: accountsData } = useSupabaseData("accounts");
  const accounts = (accountsData as any[]) || [];

  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    const updates: any = {};
    if (editDate && date) updates.date = date;
    if (editCategory && category) updates.category = category;
    if (editAmount && amount) {
      const normalized = amount.replace(/\./g, "").replace(",", ".");
      updates.amount = parseFloat(normalized);
    }
    if (editAccount) {
      updates.account_id = accountId === "none" ? null : accountId;
    }

    if (Object.keys(updates).length === 0) {
      toast.error("Nenhuma alteração selecionada.");
      setLoading(false);
      return;
    }

    await onApply(updates);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Edição em Massa</DialogTitle>
          <p className="text-sm text-muted-foreground">{selectedCount} transações selecionadas</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={editDate} onCheckedChange={setEditDate} className="data-[state=checked]:bg-[#2D9B73]" />
              <Label className="text-sm font-bold text-slate-700">Alterar data</Label>
            </div>
            {editDate && (
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" />
            )}
          </div>

          {/* Category */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={editCategory} onCheckedChange={setEditCategory} className="data-[state=checked]:bg-[#2D9B73]" />
              <Label className="text-sm font-bold text-slate-700">Alterar categoria</Label>
            </div>
            {editCategory && (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={editAmount} onCheckedChange={setEditAmount} className="data-[state=checked]:bg-[#2D9B73]" />
              <Label className="text-sm font-bold text-slate-700">Alterar valor</Label>
            </div>
            {editAmount && (
              <Input
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            )}
          </div>

          {/* Account */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={editAccount} onCheckedChange={setEditAccount} className="data-[state=checked]:bg-[#2D9B73]" />
              <Label className="text-sm font-bold text-slate-700">Alterar conta vinculada</Label>
            </div>
            {editAccount && (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-11 rounded-xl border-[#2D9B73] focus:ring-1 focus:ring-[#2D9B73] text-slate-700">
                  <SelectValue placeholder="Selecionar conta" />
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
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="flex-1 rounded-xl h-11 bg-[#2D9B73] hover:bg-[#258563]"
            onClick={handleApply}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Aplicar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Extrato = () => {
  const { selectedDate } = useDate();
  const [filter, setFilter] = useState<"todas" | "realizadas" | "pendentes">("todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Selection Mode States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  // Search & Detailed Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactionsData, isLoading: isLoadingTransactions } = useSupabaseData("transactions");
  const { data: investmentsData } = useSupabaseData("investments");
  const { data: customCategoriesData } = useSupabaseData("categories");
  const updateTransaction = useSupabaseUpdate("transactions");
  const deleteTransaction = useSupabaseDelete("transactions");

  const customCategories = (customCategoriesData as any[]) || [];

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

  const transactions = (transactionsData as any[]) || [];

  // Parse date string as LOCAL timezone (avoids UTC midnight → previous day in BRT)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  };

  const parseAmount = (val: any) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const clean = val.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getOccurrencesInMonth = (txs: any[], m: number, y: number) => {
    const results: any[] = [];
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0);

    txs.forEach(t => {
      const startDate = parseLocalDate(t.date);

      if (!t.is_recurring) {
        if (startDate >= monthStart && startDate <= monthEnd) {
          results.push(t);
        }
        return;
      }

      if (startDate > monthEnd) return;
      if (t.repeat_until && parseLocalDate(t.repeat_until) < monthStart) return;

      if (t.frequency === 'mensal') {
        results.push({ ...t, date: format(new Date(y, m, startDate.getDate()), "yyyy-MM-dd"), isOccurrence: true });
      } else if (t.frequency === 'anual') {
        if (startDate.getMonth() === m) {
          results.push({ ...t, date: format(new Date(y, m, startDate.getDate()), "yyyy-MM-dd"), isOccurrence: true });
        }
      } else if (t.frequency === 'semanal') {
        let current = new Date(startDate);
        while (current <= monthEnd) {
          if (current >= monthStart) {
            results.push({ ...t, date: format(current, "yyyy-MM-dd"), id: `${t.id}-${current.getTime()}`, isOccurrence: true });
          }
          current.setDate(current.getDate() + 7);
        }
      }
    });
    return results;
  };

  const monthTransactions = getOccurrencesInMonth(transactions, selectedDate.getMonth(), selectedDate.getFullYear());

  const monthlyInvestments = ((investmentsData as any[]) || []).filter(i => {
    const iDate = parseLocalDate(i.date);
    return iDate.getMonth() === selectedDate.getMonth() && iDate.getFullYear() === selectedDate.getFullYear();
  }).map(i => ({
    ...i,
    amount: i.value,
    type: i.type === 'aporte' ? 'expense' : 'income',
    status: 'realizadas',
    isInvestment: true,
    category: i.category || 'investimentos'
  }));

  const allFilteredTransactions = [...monthTransactions, ...monthlyInvestments]
    .filter(t => {
      // Basic Tab Filter (Realizadas/Pendentes)
      if (filter !== "todas" && t.status !== filter) return false;

      // Search Filter
      if (searchTerm && !t.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Category Filter
      if (categoryFilter !== "todas" && t.category !== categoryFilter) return false;

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = allFilteredTransactions;

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(parseAmount(val)));
  };

  const handleToggleStatus = async (transaction: Transaction) => {
    const newStatus = transaction.status === "realizadas" ? "pendentes" : "realizadas";
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        updates: { status: newStatus }
      });
      toast.success(`Transação marcada como ${newStatus === "realizadas" ? "concluída" : "pendente"}`);
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleEdit = (transaction: Transaction) => {
    if (isSelectionMode) {
      handleToggleSelection(transaction.id);
      return;
    }
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} transações?`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteTransaction.mutateAsync(id)));
        toast.success(`${selectedIds.length} transações excluídas com sucesso!`);
        setSelectedIds([]);
        setIsSelectionMode(false);
      } catch (error) {
        toast.error("Erro ao excluir transações.");
      }
    }
  };

  const handleBulkApply = async (updates: any) => {
    try {
      await Promise.all(selectedIds.map(id => updateTransaction.mutateAsync({ id, updates })));
      toast.success(`${selectedIds.length} transações atualizadas com sucesso!`);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      toast.error("Erro ao atualizar transações.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 px-4 py-4">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Extrato de {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-1">
            Clique em qualquer transação para editar ou alterar o status de pagamento
          </p>
        </div>

        {/* Transactions Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-bold text-slate-700">Todas as Transações do Mês</h2>
              <div className="flex items-center gap-3">
                {/* Filter Tabs */}
                <div className="bg-muted/50 p-1 rounded-xl flex items-center">
                  {[
                    { id: "todas", label: "Todas" },
                    { id: "realizadas", label: "Realizadas" },
                    { id: "pendentes", label: "Pendentes" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={cn(
                        "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                        filter === f.id
                          ? "bg-white shadow-sm text-primary"
                          : "text-muted-foreground hover:text-slate-600"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block" />

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-9 h-9 rounded-lg transition-colors",
                      showFilters ? "bg-amber-50 text-amber-600" : "text-slate-500"
                    )}
                    onClick={() => {
                      setShowFilters(!showFilters);
                      if (showFilters) setCategoryFilter("todas");
                    }}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-9 h-9 rounded-lg transition-colors",
                      showSearch ? "bg-indigo-50 text-indigo-600" : "text-slate-500"
                    )}
                    onClick={() => {
                      setShowSearch(!showSearch);
                      if (showSearch) setSearchTerm("");
                    }}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-9 h-9 rounded-lg transition-colors",
                      isSelectionMode ? "bg-emerald-50 text-emerald-600" : "text-slate-500"
                    )}
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedIds([]);
                    }}
                  >
                    {isSelectionMode ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expansible Search/Filter Area */}
            {(showSearch || showFilters) && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {showSearch && (
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                )}
                {showFilters && (
                  <div className="flex-1 flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none w-full">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                        <SelectItem value="todas" className="rounded-lg">Todas as Categorias</SelectItem>
                        {/* Unique categories from current month */}
                        {Array.from(new Set([...monthTransactions, ...monthlyInvestments].map(t => t.category))).map(catId => {
                          const catInfo = allCategories.find(c => c.id === catId || c.name === catId);
                          return (
                            <SelectItem key={catId} value={catId} className="rounded-lg capitalize">
                              {catInfo?.name || catId}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selection Bar */}
          {isSelectionMode && (
            <div className="bg-muted/20 px-6 py-4 border-b border-border flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    selectedIds.length === filteredTransactions.length
                      ? "bg-primary border-primary text-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {selectedIds.length === filteredTransactions.length && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  {selectedIds.length === filteredTransactions.length ? "Desmarcar tudo" : "Selecionar todos"}
                </button>
                <span className="text-sm font-semibold text-slate-400">
                  {selectedIds.length} selecionadas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-lg h-9 gap-2 font-bold"
                  disabled={selectedIds.length === 0}
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
                <Button
                  className="bg-[#2D9B73] hover:bg-[#258563] text-white rounded-lg h-9 gap-2 font-bold"
                  disabled={selectedIds.length === 0}
                  onClick={() => setIsBulkEditOpen(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="divide-y divide-border min-h-[400px]">
            {isLoadingTransactions ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                <p className="text-sm text-muted-foreground font-medium italic">Buscando suas transações...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-20 text-center">
                <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-slate-50 mb-6 border border-slate-100">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Nenhuma transação encontrada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente ajustar seus filtros para encontrar o que procura.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredTransactions.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "p-4 flex items-center justify-between hover:bg-slate-50 transition-all group rounded-xl cursor-pointer",
                      selectedIds.includes(t.id) && "bg-emerald-50/50 border-primary/10"
                    )}
                    onClick={() => handleEdit(t)}
                  >
                    <div className="flex items-center gap-4">
                      {isSelectionMode ? (
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedIds.includes(t.id)
                            ? "bg-primary border-primary text-white"
                            : "border-slate-300 bg-white"
                        )}>
                          {selectedIds.includes(t.id) && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      ) : (
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center border transition-all shadow-sm bg-slate-50 border-slate-100 group-hover:bg-white",
                        )}>
                          <span className="text-xl">
                            {allCategories.find(c => c.id === t.category || c.name === t.category)?.icon || (t.type === "income" ? "💰" : t.type === "transfer" ? "🔄" : "📦")}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-700 text-[15px]">{t.description}</h4>
                          {t.is_recurring && <Repeat className="w-3 h-3 text-slate-300" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-0.5">
                          <span className="capitalize">
                            {allCategories.find(c => c.id === t.category || c.name === t.category)?.name || t.category}
                          </span>
                          <span>•</span>
                          <span>
                            {(() => {
                              try {
                                if (!t.date) return "";
                                const d = new Date(t.date + 'T00:00:00');
                                if (isNaN(d.getTime())) return t.date;
                                return format(d, "dd 'de' MMM.", { locale: ptBR });
                              } catch {
                                return t.date || "";
                              }
                            })()}
                          </span>
                        </div>
                        {t.type === "transfer" && (
                          <p className="text-[10px] text-blue-500 font-semibold mt-0.5 italic">
                            Transferência interna — não impacta o resultado
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className={cn(
                          "font-black text-base",
                          t.type === "income" ? "text-[#2D9B73]" : t.type === "transfer" ? "text-blue-600" : "text-[#D94E38]"
                        )}>
                          {t.type === "income" ? "+" : t.type === "transfer" ? "" : "-"} {formatCurrency(t.amount)}
                        </span>
                      </div>

                      {!isSelectionMode && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={t.status === "realizadas"}
                            onCheckedChange={() => handleToggleStatus(t)}
                            className="data-[state=checked]:bg-[#2D9B73]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        transaction={editingTransaction as any}
      />

      <BulkEditModal
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        selectedCount={selectedIds.length}
        allCategories={allCategories}
        onApply={handleBulkApply}
      />
    </MainLayout>
  );
};

export default Extrato;
