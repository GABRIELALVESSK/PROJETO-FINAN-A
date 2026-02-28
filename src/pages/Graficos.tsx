import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
} from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabase";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CategoryTransactionsModal } from "@/components/modals/CategoryTransactionsModal";

const EXPENSE_COLORS = [
  "#2D9B73", "#3BB88A", "#1E7A5A", "#4ECBA0",
  "#D94E38", "#F07460", "#B03828", "#FF8A77",
  "#4A90D9", "#6DAEE8", "#2E6DAD", "#89C4F4",
  "#F5A623", "#F7BE55", "#C27E00", "#FFD07A",
  "#9B59B6", "#B07FCC", "#7D3C98", "#C39BD3",
];

const INCOME_COLORS = [
  "#2D9B73", "#3BB88A", "#4ECBA0", "#1E7A5A",
  "#52D4A8", "#79DEC0", "#1A6B4E", "#A8F0DC",
];

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3 text-sm">
        <p className="font-bold text-slate-700 capitalize mb-1">{data.name}</p>
        <p className="font-black text-slate-900">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.value)}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{data.payload.percentage?.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const Graficos = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [drilldown, setDrilldown] = useState<{
    categoryName: string;
    categoryId: string;
    type: "income" | "expense";
  } | null>(null);

  const { data: transactionsData, isLoading } = useSupabaseData("transactions");
  const { data: customCategoriesData } = useSupabaseData("categories");
  const transactions = (transactionsData as any[]) || [];
  const customCategories = (customCategoriesData as any[]) || [];

  // Default categories Master list (simplified for lookup)
  const defaultCategories = [
    { id: "salario", name: "Salário" },
    { id: "vale-refeicao", name: "Vale Refeição" },
    { id: "vale-alimentacao", name: "Vale Alimentação" },
    { id: "bonus", name: "Bônus/PLR" },
    { id: "ferias", name: "Férias" },
    { id: "decimo-terceiro", name: "13º Salário" },
    { id: "servicos", name: "Serviços Prestados" },
    { id: "projeto", name: "Projeto/Freela" },
    { id: "consultoria", name: "Consultoria" },
    { id: "venda", name: "Venda de Produto" },
    { id: "comissao", name: "Comissão" },
    { id: "aluguel", name: "Aluguel/Locação" },
    { id: "dividendos", name: "Dividendos/Lucros" },
    { id: "outros", name: "Outros" },
    { id: "investimentos", name: "Investimentos" },
    { id: "moradia", name: "Moradia" },
    { id: "alimentacao", name: "Alimentação" },
    { id: "transporte", name: "Transporte" },
    { id: "saude", name: "Saúde" },
    { id: "educacao", name: "Educação" },
    { id: "lazer", name: "Lazer" },
    { id: "vestuario", name: "Vestuário" },
    { id: "compras", name: "Compras" },
    { id: "servicos-despesa", name: "Serviços" },
    { id: "assinaturas", name: "Assinaturas" },
    { id: "impostos", name: "Impostos" },
    { id: "doacoes", name: "Doações e Ofertas" },
    { id: "pet", name: "Pet" },
    { id: "viagens", name: "Viagens" },
    { id: "beleza", name: "Beleza e Cuidados" },
    { id: "streaming", name: "Streaming/Apps" },
    { id: "dividas", name: "Dívidas" },
    { id: "outros-despesas", name: "Outros" },
  ];

  const allCategories = useMemo(() => {
    const combined = [...defaultCategories];
    customCategories.forEach(custom => {
      combined.push({ id: custom.id, name: custom.nome });
    });
    return combined;
  }, [customCategories]);

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = String(dateStr).split("T")[0].split("-");
    if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return new Date(dateStr);
  };

  // Filter transactions for selected month/year (including recurring)
  const getMonthTransactions = () => {
    const results: any[] = [];
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

    transactions.forEach(t => {
      const startDate = parseLocalDate(t.date);
      if (!t.is_recurring) {
        if (startDate >= monthStart && startDate <= monthEnd) results.push(t);
        return;
      }
      if (startDate > monthEnd) return;
      const repeatEnd = t.repeat_until ? parseLocalDate(t.repeat_until) : null;
      if (repeatEnd && repeatEnd < monthStart) return;
      if (t.frequency === "mensal") {
        results.push({ ...t, date: format(new Date(selectedYear, selectedMonth, startDate.getDate()), "yyyy-MM-dd") });
      } else if (t.frequency === "anual" && startDate.getMonth() === selectedMonth) {
        results.push({ ...t, date: format(new Date(selectedYear, selectedMonth, startDate.getDate()), "yyyy-MM-dd") });
      } else if (t.frequency === "semanal") {
        let current = new Date(startDate);
        while (current <= monthEnd) {
          if (current >= monthStart) results.push({ ...t, date: format(current, "yyyy-MM-dd"), id: `${t.id}-${current.getTime()}` });
          current.setDate(current.getDate() + 7);
        }
      }
    });
    return results;
  };

  const monthTransactions = getMonthTransactions();

  const buildCategories = (type: "income" | "expense", colors: string[]) => {
    const map = monthTransactions
      .filter(t => t.type === type)
      .reduce((acc: any, t) => {
        const catId = t.category || "outros";
        const catInfo = allCategories.find(c => c.id === catId || c.name === catId);
        const name = catInfo?.name || catId;

        if (!acc[name]) acc[name] = { total: 0, id: catId };
        acc[name].total += Number(t.amount || 0);
        return acc;
      }, {});

    const total = Object.values(map).reduce((a: any, b: any) => a + (b.total || 0), 0) as number;
    return Object.entries(map)
      .map(([name, data]: any, i) => ({
        name,
        id: data.id,
        value: data.total,
        color: colors[i % colors.length],
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const incomeCategories = buildCategories("income", INCOME_COLORS);
  const expenseCategories = buildCategories("expense", EXPENSE_COLORS);

  const totalIncome = incomeCategories.reduce((acc, c) => acc + c.value, 0);
  const totalExpense = expenseCategories.reduce((acc, c) => acc + c.value, 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // Drilldown data
  const drilldownTransactions = useMemo(() => {
    if (!drilldown) return [];
    return monthTransactions.filter(t => {
      if (t.type !== drilldown.type) return false;
      const catId = t.category || "outros";
      const catInfo = allCategories.find(c => c.id === catId || c.name === catId);
      return (catId === drilldown.categoryId || (catInfo?.name === drilldown.categoryName));
    });
  }, [drilldown, monthTransactions, allCategories]);

  const drilldownTotal = drilldownTransactions.reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

  const ChartCard = ({ type, categories, total, colors }: { type: "income" | "expense"; categories: any[]; total: number; colors: string[] }) => {
    const isIncome = type === "income";
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-50`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIncome ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[15px]">{isIncome ? "Receitas" : "Despesas"}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{categories.length} {categories.length === 1 ? "categoria" : "categorias"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xl font-black ${isIncome ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(total)}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">total</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isIncome ? "bg-emerald-50" : "bg-red-50"}`}>
              {isIncome ? <TrendingUp className="w-7 h-7 text-emerald-300" /> : <TrendingDown className="w-7 h-7 text-red-300" />}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {isIncome ? "Nenhuma receita no período" : "Nenhuma despesa no período"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start gap-0">
            {/* Pie Chart */}
            <div className="w-full md:w-[260px] h-[220px] flex-shrink-0 px-2 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    innerRadius={72}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List - Now clickable! */}
            <div className="flex-1 divide-y divide-slate-50 w-full py-2">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  onClick={() => setDrilldown({ categoryName: cat.name, categoryId: (cat as any).id, type })}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-[13px] font-semibold text-slate-700 capitalize truncate group-hover:text-slate-900 transition-colors">{cat.name}</span>
                  <span className="text-[13px] font-black text-slate-800">{formatCurrency(cat.value)}</span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[42px] text-center"
                    style={{ backgroundColor: cat.color + "20", color: cat.color }}
                  >
                    {cat.percentage.toFixed(1)}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Gráficos</h1>
              <p className="text-xs text-slate-400 font-medium">Visualização por categoria</p>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-sm font-bold text-slate-700 min-w-[140px] text-center">
              {months[selectedMonth]} {selectedYear}
            </div>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receitas</p>
              <p className="text-base font-black text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Despesas</p>
              <p className="text-base font-black text-red-500">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
          <div className={`rounded-2xl border shadow-sm p-4 flex items-center gap-3 ${balance >= 0 ? "bg-white border-slate-100" : "bg-red-50/40 border-red-100"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balance >= 0 ? "bg-emerald-50" : "bg-red-100"}`}>
              <span className="text-lg">{balance >= 0 ? "💰" : "⚠️"}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo</p>
              <p className={`text-base font-black ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <ChartCard type="income" categories={incomeCategories} total={totalIncome} colors={INCOME_COLORS} />
          <ChartCard type="expense" categories={expenseCategories} total={totalExpense} colors={EXPENSE_COLORS} />
        </div>

        {/* Category Drilldown Modal */}
        <CategoryTransactionsModal
          open={!!drilldown}
          onOpenChange={(v) => { if (!v) setDrilldown(null); }}
          categoryName={drilldown?.categoryName || ""}
          categoryIcon=""
          type={drilldown?.type || "expense"}
          transactions={drilldownTransactions}
          total={drilldownTotal}
        />
      </div>
    </MainLayout>
  );
};

export default Graficos;
