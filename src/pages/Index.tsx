import { useState, useMemo } from "react";
import { Plus, Home, Coins, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, ArrowRight, Table as TableIcon, BarChart3, TrendingUp as LineChartIcon, Sparkles, PiggyBank } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { RemindersBanner } from "@/components/dashboard/RemindersBanner";
import { ExpensesByCategory } from "@/components/dashboard/ExpensesByCategory";
import { IncomeVsExpensesChart } from "@/components/dashboard/IncomeVsExpensesChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useSupabaseData } from "@/hooks/useSupabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { Button } from "@/components/ui/button";
import { useDate } from "@/contexts/DateContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryTransactionsModal } from "@/components/modals/CategoryTransactionsModal";

const monthsLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const categoriesMaster = [
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

const CategoryChartModal = ({ open, onOpenChange, category, monthlyData, year }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: { name: string; icon: any } | null;
  monthlyData: { name: string; valor: number }[];
  year: number;
}) => {
  if (!category) return null;
  const total = monthlyData.reduce((acc, d) => acc + d.valor, 0);
  const avg = total / 12;
  const formatC = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 bg-white border-none shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#D94E38]" />
            <span className="text-lg">{category.icon}</span>
            {category.name} - {year}
          </DialogTitle>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Bar Chart */}
          <div className="px-6 pt-4 pb-2">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px -3px rgb(0 0 0 / 0.15)', fontSize: '12px' }}
                    formatter={(value: any) => [formatC(value), category.name]}
                  />
                  <Bar dataKey="valor" fill="#D94E38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-3 px-6 py-4 bg-slate-50/60 border-y border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Anual</p>
              <p className="text-base font-black text-[#D94E38] mt-0.5">{formatC(total)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Média Mensal</p>
              <p className="text-base font-black text-slate-700 mt-0.5">{formatC(avg)}</p>
            </div>
          </div>

          {/* Monthly Breakdown List */}
          <div className="px-6 py-2 divide-y divide-slate-50">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-semibold text-[#D94E38]">{d.name}</span>
                <span className={cn(
                  "text-sm font-bold",
                  d.valor > 0 ? "text-slate-700" : "text-slate-300"
                )}>{formatC(d.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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

const Index = () => {
  const navigate = useNavigate();
  const { selectedDate, setSelectedDate } = useDate();
  const [viewType, setViewType] = useState<"mensal" | "anual">("mensal");
  const [remindersExpanded, setRemindersExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [tableFilter, setTableFilter] = useState<"todos" | "realizado" | "projetado">("todos");
  const [categoryChart, setCategoryChart] = useState<{ name: string; icon: any } | null>(null);
  const [drilldownCategory, setDrilldownCategory] = useState<{
    categoryId: string;
    categoryName: string;
    type: "income" | "expense";
  } | null>(null);

  const { data: transactionsData, isLoading: isLoadingTransactions } = useSupabaseData("transactions");
  const { data: investmentsData } = useSupabaseData("investments");
  const { data: accountsData } = useSupabaseData("accounts");
  const { data: customCategoriesData } = useSupabaseData("categories");

  const transactions = (transactionsData as any[]) || [];
  const investments = (investmentsData as any[]) || [];
  const accounts = (accountsData as any[]) || [];
  const customCategories = (customCategoriesData as any[]) || [];

  // Merge default categories with custom ones from DB
  const allCategories = useMemo(() => {
    const combined = [...categoriesMaster];

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

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Recurring Transaction Expansion Logic
  const parseLocalDate = (dateStr: any) => {
    try {
      if (!dateStr) return new Date();
      const str = String(dateStr).split('T')[0];
      const parts = str.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) return d;
      }
      const d2 = new Date(dateStr);
      if (!isNaN(d2.getTime())) return d2;
      return new Date();
    } catch {
      return new Date();
    }
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

      // Recurring check
      if (startDate > monthEnd) return;
      const repeatEnd = t.repeat_until ? parseLocalDate(t.repeat_until) : null;
      if (repeatEnd && repeatEnd < monthStart) return;

      if (t.frequency === 'mensal') {
        results.push({ ...t, date: format(new Date(y, m, startDate.getDate()), "yyyy-MM-dd") });
      } else if (t.frequency === 'anual') {
        if (startDate.getMonth() === m) {
          results.push({ ...t, date: format(new Date(y, m, startDate.getDate()), "yyyy-MM-dd") });
        }
      } else if (t.frequency === 'semanal') {
        let current = new Date(startDate);
        while (current <= monthEnd) {
          if (current >= monthStart) {
            results.push({ ...t, date: format(current, "yyyy-MM-dd"), id: `${t.id}-${current.getTime()}` });
          }
          current.setDate(current.getDate() + 7);
        }
      }
    });
    return results;
  };

  const calculatePriorBalance = (txs: any[], m: number, y: number) => {
    const limitDate = new Date(y, m, 1);
    let total = 0;

    txs.forEach(t => {
      const startDate = parseLocalDate(t.date);

      if (!t.is_recurring) {
        if (startDate < limitDate && t.type !== 'transfer') {
          total += (t.type === 'income' ? 1 : -1) * parseAmount(t.amount);
        }
        return;
      }

      if (startDate >= limitDate) return;

      const repeatEnd = t.repeat_until ? parseLocalDate(t.repeat_until) : null;
      const effectiveEnd = repeatEnd && repeatEnd < limitDate
        ? repeatEnd
        : new Date(limitDate.getTime() - 1);

      if (t.frequency === 'mensal') {
        const months = (effectiveEnd.getFullYear() * 12 + effectiveEnd.getMonth())
          - (startDate.getFullYear() * 12 + startDate.getMonth()) + 1;
        if (months > 0 && t.type !== 'transfer') total += months * (t.type === 'income' ? 1 : -1) * parseAmount(t.amount);
      } else if (t.frequency === 'anual') {
        const years = effectiveEnd.getFullYear() - startDate.getFullYear()
          + (effectiveEnd.getMonth() >= startDate.getMonth() ? 1 : 0);
        if (years > 0 && t.type !== 'transfer') total += years * (t.type === 'income' ? 1 : -1) * Number(t.amount || 0);
      } else if (t.frequency === 'semanal') {
        let current = new Date(startDate);
        while (current < limitDate && (!repeatEnd || current <= repeatEnd)) {
          if (t.type !== 'transfer') total += (t.type === 'income' ? 1 : -1) * parseAmount(t.amount);
          current.setDate(current.getDate() + 7);
        }
      }
    });
    return isNaN(total) ? 0 : total;
  };

  // Monthly Data Calculation
  const monthlyTransactions = getOccurrencesInMonth(transactions, month, year);

  // Annual Logic
  const annualMonthlyData = monthsLabels.map((label, i) => {
    const monthTx = getOccurrencesInMonth(transactions, i, year);

    const income = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + parseAmount(t.amount), 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseAmount(t.amount), 0);

    return {
      name: label,
      receitas: income,
      despesas: expense,
      projetado: (year === new Date().getFullYear() && i > new Date().getMonth()) ? expense : 0,
      balance: income - expense
    };
  });

  const cumulativeBalances = (() => {
    let currentRolling = calculatePriorBalance(transactions, 0, year);
    return annualMonthlyData.map(d => {
      currentRolling += d.balance;
      return { name: d.name, saldo: Number(currentRolling.toFixed(2)) };
    });
  })();

  const balanceEvolutionData = cumulativeBalances;

  // Table Data
  const tableData = (() => {
    let rolling = calculatePriorBalance(transactions, 0, year);
    return annualMonthlyData.map(d => {
      const prev = rolling;
      rolling += d.balance;
      return { ...d, saldoAnterior: prev, saldoMes: d.balance };
    });
  })();

  const annualIncome = annualMonthlyData.reduce((acc, d) => acc + d.receitas, 0);
  const annualExpense = annualMonthlyData.reduce((acc, d) => acc + d.despesas, 0);
  const annualBalance = annualIncome - annualExpense;

  // For avg: use months elapsed this year (if current year), otherwise 12
  const today = new Date();
  const monthsElapsed = year === today.getFullYear()
    ? Math.max(1, today.getMonth() + 1)
    : 12;

  // Formatting utils
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Investment Data for current month
  const monthlyInvestments = investments.filter(i => {
    const iDate = new Date(i.date);
    return iDate.getMonth() === month && iDate.getFullYear() === year;
  });

  const accountBalances = accounts.reduce((acc, a) => acc + parseAmount(a.balance), 0);

  const monthlyAportes = monthlyInvestments.filter(i => i.type === 'aporte').reduce((acc, i) => acc + parseAmount(i.value), 0);
  const monthlyRetiradas = monthlyInvestments.filter(i => i.type === 'retirada').reduce((acc, i) => acc + parseAmount(i.value), 0);

  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseAmount(t.amount), 0) + monthlyRetiradas;
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseAmount(t.amount), 0) + monthlyAportes;

  const resultado = totalIncome - totalExpense;

  // Only show account balance if accounts exist with real balance data
  const hasRealBalance = accounts.length > 0;
  const currentTotalBalance = hasRealBalance ? accountBalances : undefined;
  const previousBalance = hasRealBalance ? (accountBalances - resultado) : undefined;

  const totalInvested = investments.reduce((acc, curr) => curr.type === 'aporte' ? acc + parseAmount(curr.value) : acc - parseAmount(curr.value), 0);

  // Merge transactions and investments for the list
  const allMonthlyActivity = [
    ...monthlyTransactions.map(t => ({ ...t, activityType: 'transaction' })),
    ...monthlyInvestments.map(i => ({
      id: i.id,
      description: i.description,
      amount: i.value,
      category: i.category || 'investimentos',
      date: i.date,
      type: i.type === 'aporte' ? 'expense' : 'income',
      isInvestment: true,
      activityType: 'investment'
    }))
  ];

  const categorySummary = allMonthlyActivity
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const catInfo = allCategories.find(c => c.id === t.category || c.name === t.category);
      const catName = t.isInvestment ? "Investimentos" : (catInfo?.name || t.category);

      const existing = acc.find((c: any) => c.name === catName);
      if (existing) {
        existing.amount += parseAmount(t.amount);
      } else {
        acc.push({
          id: t.category,
          name: catName,
          amount: parseAmount(t.amount),
          icon: <span className="text-base">{t.isInvestment ? "📈" : (catInfo?.icon || "📦")}</span>,
          color: "#2D9B73"
        });
      }
      return acc;
    }, []);

  const categories = categorySummary.map((c: any) => ({
    ...c,
    percentage: totalExpense > 0 ? (c.amount / totalExpense) * 100 : 0
  })).sort((a: any, b: any) => b.amount - a.amount);

  // Income Category Summary (similar to expense)
  const incomeCategorySummary = allMonthlyActivity
    .filter(t => t.type === 'income')
    .reduce((acc: any, t) => {
      const catInfo = allCategories.find(c => c.id === t.category || c.name === t.category);
      const catName = (t as any).isInvestment ? "Retirada Investimento" : (catInfo?.name || t.category);

      const existing = acc.find((c: any) => c.name === catName);
      if (existing) {
        existing.amount += parseAmount(t.amount);
      } else {
        acc.push({
          id: t.category,
          name: catName,
          amount: parseAmount(t.amount),
          icon: <span className="text-base">{(t as any).isInvestment ? "📈" : (catInfo?.icon || "💰")}</span>,
          color: "#2D9B73"
        });
      }
      return acc;
    }, []);

  const incomeCategories = incomeCategorySummary.map((c: any) => ({
    ...c,
    percentage: totalIncome > 0 ? (c.amount / totalIncome) * 100 : 0
  })).sort((a: any, b: any) => b.amount - a.amount);

  // Drilldown data
  const drilldownTransactions = useMemo(() => {
    if (!drilldownCategory) return [];
    return allMonthlyActivity.filter(t => {
      if (t.type !== drilldownCategory.type) return false;
      const catInfo = allCategories.find(c => c.id === t.category || c.name === t.category);
      return (
        t.category === drilldownCategory.categoryId ||
        t.category === drilldownCategory.categoryName ||
        catInfo?.name === drilldownCategory.categoryName
      );
    });
  }, [drilldownCategory, allMonthlyActivity]);

  const drilldownTotal = drilldownTransactions.reduce((acc, t) => acc + parseAmount(t.amount), 0);
  const drilldownIcon = drilldownCategory
    ? allCategories.find(c => c.id === drilldownCategory.categoryId || c.name === drilldownCategory.categoryName)?.icon || "📦"
    : "";

  const percentageCompromised = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  const chartData = [
    { label: "Receitas", valor: totalIncome },
    { label: "Despesas", valor: totalExpense }
  ];

  const recentTransactions = [...allMonthlyActivity]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(t => {
      const catInfo = allCategories.find(c => c.id === t.category || c.name === t.category);
      return {
        ...t,
        categoryName: catInfo?.name || t.category,
        dateFormatted: (() => {
          try {
            if (!t.date) return "";
            const d = new Date(t.date + 'T00:00:00');
            if (isNaN(d.getTime())) return t.date;
            return format(d, "dd 'de' MMM.", { locale: ptBR });
          } catch {
            return t.date || "";
          }
        })(),
        icon: <span className="text-base">{(t as any).isInvestment ? "📈" : (catInfo?.icon || (t.type === 'income' ? "💰" : t.type === 'transfer' ? "🔄" : "📦"))}</span>
      };
    });

  if (isLoadingTransactions) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        <TrialBanner daysLeft={2} hoursLeft={22} expired={false} />

        <div className="flex flex-col items-center gap-4 py-1">
          <Button
            className="w-full max-w-[500px] bg-[#2D9B73] hover:bg-[#258563] text-white h-10 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2"
            onClick={handleNewTransaction}
          >
            <Plus className="w-5 h-5" /> Nova Transação
          </Button>

          <ViewToggle value={viewType} onChange={setViewType} />
        </div>

        {viewType === "mensal" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {hasRealBalance && (
                <SummaryCard title="Saldo Anterior" value={previousBalance!} type="neutral" icon={ArrowRight} />
              )}
              <SummaryCard title="Receitas" value={totalIncome} type="income" icon={TrendingUp} />
              <SummaryCard title="Despesas" value={totalExpense} type="expense" icon={TrendingDown} />
              <SummaryCard
                title="Resultado do Período"
                value={resultado}
                type={resultado < 0 ? "expense" : "balance"}
                icon={Wallet}
              />
              {hasRealBalance && (
                <SummaryCard
                  title="Saldo da Conta"
                  value={currentTotalBalance!}
                  type={currentTotalBalance! < 0 ? "expense" : "balance"}
                  icon={Wallet}
                />
              )}
              <SummaryCard title="Investimentos" value={totalInvested} type="income" icon={PiggyBank} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpensesByCategory
                categories={categories}
                total={totalExpense}
                onCategoryClick={(id, name) => setDrilldownCategory({ categoryId: id, categoryName: name, type: "expense" })}
              />
              <IncomeVsExpensesChart data={chartData} percentage={percentageCompromised} />
            </div>

            {/* Receitas e Despesas por Categoria - Detalhado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Receitas Card */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm h-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2D9B73]" />
                    <div>
                      <h3 className="font-bold text-[13px] text-slate-800 tracking-tight">Receitas Detalhadas</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {incomeCategories.length} categorias
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#2D9B73]">{formatCurrency(totalIncome)}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">total</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                  {incomeCategories.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">Sem receitas registradas.</div>
                  ) : (
                    incomeCategories.map((cat: any) => (
                      <div
                        key={cat.id}
                        className="group cursor-pointer hover:bg-emerald-50/40 -mx-2 px-2 py-1.5 rounded-xl transition-all"
                        onClick={() => setDrilldownCategory({ categoryId: cat.id, categoryName: cat.name, type: "income" })}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm text-slate-500">●</span>
                            <span className="text-sm font-bold text-slate-700 capitalize">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800">{formatCurrency(cat.amount)}</span>
                            <span className="text-[10px] font-black text-[#2D9B73] bg-[#EAF9F5] px-2 py-0.5 rounded-md min-w-[40px] text-center">
                              {cat.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Despesas Card */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm h-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#D94E38]" />
                    <div>
                      <h3 className="font-bold text-[13px] text-slate-800 tracking-tight">Despesas Detalhadas</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {categories.length} categorias
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#D94E38]">{formatCurrency(totalExpense)}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">total</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                  {categories.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">Sem despesas registradas.</div>
                  ) : (
                    categories.map((cat: any) => (
                      <div
                        key={cat.id}
                        className="group cursor-pointer hover:bg-red-50/40 -mx-2 px-2 py-1.5 rounded-xl transition-all"
                        onClick={() => setDrilldownCategory({ categoryId: cat.id, categoryName: cat.name, type: "expense" })}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm text-[#D94E38]">●</span>
                            <span className="text-sm font-bold text-slate-700 capitalize">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800">{formatCurrency(cat.amount)}</span>
                            <span className="text-[10px] font-black text-[#D94E38] bg-red-50 px-2 py-0.5 rounded-md min-w-[40px] text-center">
                              {cat.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <RemindersBanner reminders={[]} expanded={remindersExpanded} onToggle={() => setRemindersExpanded(!remindersExpanded)} />

            <RecentTransactions
              transactions={recentTransactions}
              totalCount={allMonthlyActivity.length}
              onViewAll={() => navigate("/extrato")}
              onEdit={handleEdit}
            />
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Year Selector */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setSelectedDate(new Date(year - 1, 0, 1))}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-slate-700">{year}</h2>
              <button
                onClick={() => setSelectedDate(new Date(year + 1, 0, 1))}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Annual Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Receitas"
                value={annualIncome}
                type="income"
                subtitle={`Média: ${formatCurrency(annualIncome / monthsElapsed)}/mês`}
              />
              <SummaryCard
                title="Despesas"
                value={annualExpense}
                type="expense"
                subtitle={`Média: ${formatCurrency(annualExpense / monthsElapsed)}/mês`}
              />
              <SummaryCard
                title="Resultado Anual"
                value={annualBalance}
                type={annualBalance < 0 ? "expense" : "balance"}
                subtitle={`Média: ${formatCurrency(annualBalance / monthsElapsed)}/mês`}
              />
            </div>

            {/* Annual Bar Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 tracking-tight">Receitas vs Despesas</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Projetado
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={annualMonthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    <Bar name="Receitas" dataKey="receitas" fill="#2D9B73" radius={[4, 4, 0, 0]} />
                    <Bar name="Despesas" dataKey="despesas" fill="#D94E38" radius={[4, 4, 0, 0]} />
                    <Bar name="Projetado" dataKey="projetado" fill="#F9E2DB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribuição de Despesas Grid */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-500 rounded-full" />
                  <h3 className="font-bold text-slate-800 tracking-tight">Distribuição de Despesas</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Anual</p>
                  <p className="text-sm font-black text-[#D94E38]">{formatCurrency(annualExpense)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 hover:bg-white transition-all cursor-pointer"
                    onClick={() => setCategoryChart({ name: cat.name, icon: cat.icon })}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600">
                          {cat.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-[#2D9B73] rounded-full" style={{ width: `${cat.percentage}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-800">{formatCurrency(cat.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg gap-1.5"
                        onClick={() => setCategoryChart({ name: cat.name, icon: cat.icon })}
                      >
                        <BarChart3 className="w-3 h-3" /> Gráfico
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolução do Resultado Line Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <h3 className="font-bold text-slate-800 tracking-tight">Evolução do Resultado Acumulado</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      formatter={(value: any) => [
                        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                        'Resultado'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke="#2D9B73"
                      strokeWidth={2}
                      dot={{ fill: '#2D9B73', strokeWidth: 2, r: 4, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#2D9B73', strokeWidth: 0 }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detalhamento Mensal Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 tracking-tight">Detalhamento Mensal</h3>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                  {(['todos', 'realizado', 'projetado'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTableFilter(f)}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        tableFilter === f ? "bg-[#2D9B73] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês</th>
                      {hasRealBalance && (
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Saldo Anterior</th>
                      )}
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receitas</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Despesas</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Resultado Mês</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tableData.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.name}</td>
                        {hasRealBalance && (
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-center">{formatCurrency(row.saldoAnterior)}</td>
                        )}
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-center">{formatCurrency(row.receitas)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#D94E38] text-center">{formatCurrency(row.despesas)}</td>
                        <td className={cn(
                          "px-6 py-4 text-sm font-black text-right",
                          row.saldoMes >= 0 ? "text-emerald-600" : "text-[#D94E38]"
                        )}>
                          {formatCurrency(row.saldoMes)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/80">
                      <td className="px-6 py-4 text-sm font-black text-slate-800">Total</td>
                      {hasRealBalance && (
                        <td className="px-6 py-4 text-center text-slate-400">—</td>
                      )}
                      <td className="px-6 py-4 text-sm font-black text-emerald-600 text-center">{formatCurrency(annualIncome)}</td>
                      <td className="px-6 py-4 text-sm font-black text-[#D94E38] text-center">{formatCurrency(annualExpense)}</td>
                      <td className={cn(
                        "px-6 py-4 text-sm font-black text-right",
                        annualBalance >= 0 ? "text-emerald-600" : "text-[#D94E38]"
                      )}>
                        {formatCurrency(annualBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Footer Credits */}
            <div className="pt-10 pb-6 text-center space-y-2">
              <p className="text-[10px] font-bold text-slate-400">Bússola Financeira © 2026 - Todos os direitos reservados</p>
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold">
                <a href="#" className="text-slate-400 hover:text-primary">Privacidade</a>
                <span className="text-slate-200">|</span>
                <a href="mailto:suporte@bussolafinanceira.online" className="text-slate-400 hover:text-primary">suporte@bussolafinanceira.online</a>
              </div>
            </div>
          </div>
        )}
      </div>

      <TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} transaction={editingTransaction} />

      <CategoryChartModal
        open={!!categoryChart}
        onOpenChange={(v) => { if (!v) setCategoryChart(null); }}
        category={categoryChart}
        year={year}
        monthlyData={monthsLabels.map((label, i) => {
          const monthTx = getOccurrencesInMonth(transactions, i, year);
          const valor = monthTx
            .filter(t => t.type === 'expense' && (t.category === categoryChart?.name || t.category === allCategories.find((c: any) => c.name === categoryChart?.name)?.id))
            .reduce((acc, t) => acc + parseAmount(t.amount), 0);
          return { name: label, valor };
        })}
      />
      <CategoryTransactionsModal
        open={!!drilldownCategory}
        onOpenChange={(v) => { if (!v) setDrilldownCategory(null); }}
        categoryName={drilldownCategory?.categoryName || ""}
        categoryIcon={drilldownIcon as string}
        type={drilldownCategory?.type || "expense"}
        transactions={drilldownTransactions}
        total={drilldownTotal}
      />
    </MainLayout >
  );
};

export default Index;
