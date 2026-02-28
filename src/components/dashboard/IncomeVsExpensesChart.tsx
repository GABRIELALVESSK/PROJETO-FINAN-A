import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartData {
  label: string;
  valor: number;
}

interface IncomeVsExpensesChartProps {
  data: ChartData[];
  percentage: number;
}

export function IncomeVsExpensesChart({ data, percentage }: IncomeVsExpensesChartProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-bold text-[13px] text-slate-800 tracking-tight">Receitas vs Despesas</h3>
        <span className="text-[10px] font-black text-[#2D9B73] bg-[#EAF9F5] px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {percentage}% Comprometido
        </span>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            barSize={28}
            margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 0" horizontal={false} stroke="#f1f5f9" opacity={0.5} />
            <XAxis
              type="number"
              hide={true}
            />
            <YAxis
              dataKey="label"
              type="category"
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc', opacity: 0.4 }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #f1f5f9",
                borderRadius: "10px",
                padding: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />
            <Bar
              dataKey="valor"
              radius={[0, 6, 6, 0]}
              name="Valor"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.label === "Receitas" ? "#2D9B73" : "#D94E38"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 justify-center border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1.5 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2D9B73]" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Receitas</span>
        </div>
        <div className="flex items-center gap-1.5 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D94E38]" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Despesas</span>
        </div>
      </div>
    </div>
  );
}
