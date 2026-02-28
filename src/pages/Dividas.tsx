import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Plus, Banknote, TrendingDown, CheckCircle2, Search, Info,
    Calendar, BarChart3, TrendingUp, Check, ChevronRight,
    Clock, Trash2, CreditCard, Home, Users, DollarSign, Briefcase,
    FileText, AlertTriangle, ArrowLeft, Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTitle,
    DialogHeader
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData, useSupabaseInsert, useSupabaseDelete, useSupabaseUpdate } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, addMonths, addWeeks, differenceInDays, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────
interface Debt {
    id: string;
    description: string;
    category: string;
    total_value: number;
    interest_rate?: number;
    installments_count: number;
    start_date: string;
    status: "active" | "paid";
    responsible?: string;
    notes?: string;
    creditor?: string;
    installment_value?: number;
    paid_before?: number;
    frequency?: string;
    interest_rate_type?: string;
    interest_type?: string;
    amortization_system?: string;
}

interface Installment {
    id: string;
    debt_id: string;
    installment_number: number;
    due_date: string;
    amount: number;
    status: "pending" | "paid" | "overdue";
    transaction_id?: string;
}

interface Account {
    id: string;
    name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const parseNum = (v: string) => {
    if (typeof v !== 'string') return 0;
    return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
};

// Simple money mask
const moneyMask = (v: string) => {
    const value = v.replace(/\D/g, "");
    const result = (Number(value) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
    });
    return result;
};

const debtTypes = [
    { id: "emprestimo", label: "Empréstimo Pessoal", emoji: "👜" },
    { id: "cartao", label: "Cartão Parcelado", emoji: "💳" },
    { id: "financiamento", label: "Financiamento", emoji: "🏠" },
    { id: "consorcio", label: "Consórcio", emoji: "🤝" },
    { id: "informal", label: "Dívida Informal", emoji: "🤲" },
    { id: "outro", label: "Outro", emoji: "📋" },
];

const typeLabel = (id: string) => debtTypes.find(d => d.id === id)?.label ?? id;
const typeEmoji = (id: string) => debtTypes.find(d => d.id === id)?.emoji ?? "💳";

// ─── Component ───────────────────────────────────────────────────────
export default function Dividas() {
    // ── Onboarding / modal state
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("hide_debts_onboarding") !== "true";
        }
        return false;
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleOnboardingClose = (open: boolean) => {
        if (!open && dontShowAgain) {
            localStorage.setItem("hide_debts_onboarding", "true");
        }
        setIsOnboardingOpen(open);
    };
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [selectedInst, setSelectedInst] = useState<Installment | null>(null);
    const [detailTab, setDetailTab] = useState<"resumo" | "parcelas">("resumo");

    // ── Simulator state
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [simTab, setSimTab] = useState<"extra" | "full">("extra");
    const [extraPayVal, setExtraPayVal] = useState("");
    const [simResult, setSimResult] = useState<{
        interestSaving: number;
        installmentsSaved: number;
        newBalance: number;
        newEndDate: string;
    } | null>(null);

    // ── Add modal multi-step
    const [addStep, setAddStep] = useState(1);
    const [debtType, setDebtType] = useState("");
    const [debtFormat, setDebtFormat] = useState("");

    // ── Form fields (step 3)
    const [name, setName] = useState("");
    const [creditor, setCreditor] = useState("");
    const [totalValue, setTotalValue] = useState("");
    const [numInstall, setNumInstall] = useState("");
    const [installVal, setInstallVal] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [interestRateType, setInterestRateType] = useState("mensal");
    const [interestType, setInterestType] = useState("composto");
    const [amortizationSystem, setAmortizationSystem] = useState("price");
    const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [frequency, setFrequency] = useState("mensal");
    const [paidBefore, setPaidBefore] = useState("0");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    // ── Payment modal state
    const [payAccountId, setPayAccountId] = useState("");
    const [isPaying, setIsPaying] = useState(false);

    // ── Data
    const { data: rawDebts, isLoading: loadDebts } = useSupabaseData("debts");
    const { data: rawInstallments, isLoading: loadInstall } = useSupabaseData("debt_installments");
    const { data: rawAccounts } = useSupabaseData("accounts");

    const insertDebt = useSupabaseInsert("debts");
    const updateDebt = useSupabaseUpdate("debts");
    const insertInstallment = useSupabaseInsert("debt_installments");
    const deleteDebt = useSupabaseDelete("debts");
    const updateInstallment = useSupabaseUpdate("debt_installments");
    const insertTransaction = useSupabaseInsert("transactions");

    const debts = (rawDebts as Debt[] | null) ?? [];
    const installments = (rawInstallments as Installment[] | null) ?? [];
    const accounts = (rawAccounts as Account[] | null) ?? [];

    // Set default account
    useEffect(() => {
        if (accounts.length > 0 && !payAccountId) {
            setPayAccountId(accounts[0].id);
        }
    }, [accounts, payAccountId]);

    // ── Derived stats
    const stats = useMemo(() => {
        let saldo = 0;
        let pago = 0;
        let juros = 0;
        debts.forEach(d => {
            const dInst = installments.filter(i => i.debt_id === d.id);
            const paidInst = dInst.filter(i => i.status === "paid");
            const pendingInst = dInst.filter(i => i.status !== "paid");

            const pAmt = paidInst.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
            const sAmt = pendingInst.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

            pago += pAmt;
            saldo += sAmt;

            // Simplified Interest Paid logic: 
            // Calculated based on the difference between total paid and the proportional original principal
            if (Number(d.interest_rate) > 0 && dInst.length > 0) {
                const totalOriginal = Number(d.total_value || 0);
                const count = Number(d.installments_count) || 1;
                const basePrincipalPerInstallment = totalOriginal / count;

                const paidCount = paidInst.length;
                const totalPrincipalPaid = basePrincipalPerInstallment * paidCount;

                juros += Math.max(0, pAmt - totalPrincipalPaid);
            }
        });
        return { saldo, pago, juros, total: saldo + pago };
    }, [debts, installments]);

    // ── Parcelas vencendo em 7 dias (ou atrasadas)
    const soonInstallments = useMemo(() => {
        const today = startOfDay(new Date());
        return installments.filter(i => {
            if (i.status === "paid") return false;
            const due = startOfDay(new Date(i.due_date + "T00:00:00"));
            const diff = differenceInDays(due, today);
            return diff <= 7; // Includes overdue (diff < 0)
        });
    }, [installments]);

    // ── Next overall installment
    const nextInstallment = useMemo(() => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        return [...installments]
            .filter(i => i.status !== "paid")
            .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
    }, [installments]);

    const freedDate = useMemo(() => {
        const pending = installments.filter(i => i.status !== "paid");
        if (pending.length === 0) return null;
        const last = [...pending].sort((a, b) => b.due_date.localeCompare(a.due_date))[0];
        return format(new Date(last.due_date + "T00:00:00"), "MMMM 'de' yyyy", { locale: ptBR });
    }, [installments]);

    // ── Pre-calculate breakdown for selected debt
    const installmentBreakdown = useMemo(() => {
        if (!selectedDebt) return {};
        const breakdown: Record<number, { interest: number, amortization: number, total: number }> = {};

        const principal = Number(selectedDebt.total_value);
        const count = selectedDebt.installments_count;
        const rate = (Number(selectedDebt.interest_rate) || 0) / 100;
        const rateType = selectedDebt.interest_rate_type; // 'mensal' or 'anual'
        const system = selectedDebt.amortization_system; // 'price', 'sac', 'simples'

        let monthlyRate = rate;
        if (rateType === 'anual') monthlyRate = (Math.pow(1 + rate, 1 / 12) - 1);

        let currentBalance = principal;

        if (system === 'sac') {
            const amortization = principal / count;
            for (let i = 1; i <= count; i++) {
                const interest = currentBalance * monthlyRate;
                const total = amortization + interest;
                breakdown[i] = { interest, amortization, total };
                currentBalance -= amortization;
            }
        } else if (system === 'simples') {
            const amortization = principal / count;
            const interest = (principal * rate * (rateType === 'anual' ? count / 12 : count)) / count;
            for (let i = 1; i <= count; i++) {
                breakdown[i] = { interest, amortization, total: amortization + interest };
            }
        } else { // Price
            if (monthlyRate > 0) {
                const pmt = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -count));
                for (let i = 1; i <= count; i++) {
                    const interest = currentBalance * monthlyRate;
                    const amortization = pmt - interest;
                    breakdown[i] = { interest, amortization, total: pmt };
                    currentBalance -= amortization;
                }
            } else {
                const pmt = principal / count;
                for (let i = 1; i <= count; i++) {
                    breakdown[i] = { interest: 0, amortization: pmt, total: pmt };
                }
            }
        }
        return breakdown;
    }, [selectedDebt]);

    // ─────── Handlers ────────────────────────────────────────────────
    const openAddModal = () => {
        setAddStep(1); setDebtType(""); setDebtFormat("");
        setName(""); setCreditor(""); setTotalValue(""); setNumInstall("");
        setInstallVal(""); setInterestRate("");
        setInterestRateType("mensal"); setInterestType("composto"); setAmortizationSystem("price");
        setStartDate(format(new Date(), "yyyy-MM-dd"));
        setFrequency("mensal"); setPaidBefore("0"); setNotes("");
        setIsAddModalOpen(true);
    };

    const handleNext = () => {
        if (addStep === 1 && !debtType) { toast.error("Selecione o tipo da dívida."); return; }
        if (addStep === 2 && !debtFormat) { toast.error("Selecione o formato."); return; }

        // Auto-calculate if format is juros and we have some data (optional refinement)
        setAddStep(s => s + 1);
    };

    const handleSave = async () => {
        if (!name || !totalValue || !numInstall || !startDate) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const tv = parseNum(totalValue);
            const ni = parseInt(numInstall, 10);
            const pb = parseInt(paidBefore, 10) || 0;
            const rate = parseFloat(interestRate.replace(",", ".")) || 0;

            let iv = parseNum(installVal);

            // If interest rate format, calculate PMT (Price Table)
            if (debtFormat === 'juros') {
                const tv_num = tv || 0;
                const ni_num = ni || 1;
                const rate_num = rate || 0;

                if (rate_num > 0) {
                    let r = rate_num / 100;
                    if (interestRateType === 'anual') r = r / 12;
                    iv = (tv_num * r) / (1 - Math.pow(1 + r, -ni_num));
                } else {
                    iv = tv_num / ni_num;
                }
            }

            // Insert debt using hook
            const debtRows = await insertDebt.mutateAsync({
                description: name,
                category: debtType,
                total_value: tv || (ni * iv),
                interest_rate: rate,
                installments_count: ni,
                start_date: startDate,
                status: "active",
                responsible: creditor,
                installment_value: iv,
                paid_before: pb,
                interest_rate_type: interestRateType,
                interest_type: interestType,
                amortization_system: amortizationSystem,
                frequency,
                notes,
            });

            if (!debtRows || debtRows.length === 0) throw new Error("Falha ao criar dívida.");
            const debt = debtRows[0];

            // Generate installments
            const installmentsToInsert = [];
            const tv_num = tv || 0;
            const ni_num = ni || 1;
            const rate_num = rate || 0;
            let currentBalance = tv_num;
            let r = rate_num / 100;
            if (interestRateType === 'anual') r = r / 12;

            for (let i = 0; i < ni; i++) {
                let instAmt = iv; // Default to Price system's calculated iv or user-inputted installVal

                if (debtFormat === 'juros') {
                    if (amortizationSystem === 'sac') {
                        const amortization = tv_num / ni_num;
                        const interest = currentBalance * r;
                        instAmt = amortization + interest;
                        currentBalance -= amortization;
                    } else if (amortizationSystem === 'simples') {
                        // Total interest = Principal * rate * count
                        const totalInterest = tv_num * r * ni_num;
                        instAmt = (tv_num + totalInterest) / ni_num;
                    }
                }

                let due: Date;
                const base = new Date(startDate + "T00:00:00");
                if (frequency === "mensal") due = addMonths(base, i);
                else if (frequency === "semanal") due = addWeeks(base, i);
                else due = addMonths(base, Math.floor(i / 2)); // quinzenal approx

                installmentsToInsert.push({
                    debt_id: debt.id,
                    installment_number: i + 1,
                    due_date: format(due, "yyyy-MM-dd"),
                    amount: instAmt,
                    status: i < pb ? "paid" : "pending",
                });
            }
            await insertInstallment.mutateAsync(installmentsToInsert);

            toast.success("Dívida cadastrada com sucesso!");
            setIsAddModalOpen(false);
            insertDebt.reset();
        } catch (e: any) {
            console.error("Save error detail:", e);
            // Fallback for schema cache error: if it fails once, it might be the cache. 
            // We notify and try to explain to the user, but the hook already handles basic retries.
            toast.error("Erro ao salvar: " + (e.message || "Verifique se todas as colunas existem no banco."));
        } finally {
            setSaving(false);
        }
    };

    const handleMarkPaidClick = (inst: Installment) => {
        if (inst.status === "paid") {
            // Confirmation to undo
            if (confirm("Deseja desmarcar esta parcela como paga? (A transação no extrato não será deletada automaticamente)")) {
                handleUndoPaid(inst);
            }
            return;
        }
        setSelectedInst(inst);
        setIsPayModalOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedInst || !selectedDebt || !payAccountId) return;
        setIsPaying(true);
        try {
            // 1. Create transaction
            const tData = await insertTransaction.mutateAsync({
                description: `Parcela ${selectedInst.installment_number}/${selectedDebt.installments_count} - ${selectedDebt.description}`,
                amount: Number(selectedInst.amount),
                type: "expense",
                category: "dividas",
                date: format(new Date(), "yyyy-MM-dd"),
                account_id: payAccountId,
                status: "realizadas"
            });

            if (!tData || tData.length === 0) throw new Error("Falha ao criar transação.");

            // 2. Update installment
            await updateInstallment.mutateAsync({
                id: selectedInst.id,
                updates: {
                    status: "paid",
                    transaction_id: tData[0].id
                }
            });

            // 3. Check if all installments are paid
            const dInst = installments.filter(i => i.debt_id === selectedDebt.id);
            const pending = dInst.filter(i => i.id !== selectedInst.id && i.status !== "paid");

            if (pending.length === 0) {
                await updateDebt.mutateAsync({
                    id: selectedDebt.id,
                    updates: { status: "paid" }
                });
                toast.success("Dívida quitada com sucesso!");
            } else {
                toast.success("Pagamento registrado!");
            }

            setIsPayModalOpen(false);
        } catch (e: any) {
            toast.error("Erro ao pagar: " + e.message);
        } finally {
            setIsPaying(false);
        }
    };

    // Reset simulation when modal opens or tab changes
    useEffect(() => {
        if (!isSimModalOpen) {
            setSimResult(null);
            setExtraPayVal("");
        }
    }, [isSimModalOpen]);

    useEffect(() => {
        setSimResult(null);
    }, [simTab]);

    const handleSimulateExtra = () => {
        if (!selectedDebt || !extraPayVal) return;
        const extra = parseNum(extraPayVal);
        if (extra <= 0) return;

        const dInst = installments.filter(i => i.debt_id === selectedDebt.id);
        const pending = dInst.filter(i => i.status !== "paid").sort((a, b) => a.installment_number - b.installment_number);
        const currentBalance = pending.reduce((acc, i) => acc + Number(i.amount || 0), 0);

        if (extra > currentBalance) {
            toast.error("Pagamento extra não pode ser maior que o saldo devedor.");
            return;
        }

        const newBalance = currentBalance - extra;

        let installmentsSaved = 0;
        let interestSaving = 0;

        const monthlyRate = (Number(selectedDebt.interest_rate) || 0) / 100;
        let adjustedRate = monthlyRate;
        if (selectedDebt.interest_rate_type === 'anual') adjustedRate = (Math.pow(1 + monthlyRate, 1 / 12) - 1);

        let tempExtra = extra;
        const sortedPending = [...pending].sort((a, b) => b.installment_number - a.installment_number);

        for (const inst of sortedPending) {
            const instAmt = Number(inst.amount || 0);
            if (tempExtra >= instAmt) {
                tempExtra -= instAmt;
                installmentsSaved++;
            } else {
                break;
            }
        }

        if (adjustedRate > 0) {
            // More realistic economy: total interest avoided on the amortized amount
            // Interest saving = extra * ((1 + r)^n - 1)
            const n = pending.length;
            interestSaving = extra * (Math.pow(1 + adjustedRate, n / 2) - 1);
        }

        const lastInst = pending[pending.length - 1];
        if (lastInst) {
            const lastDate = parseISO(lastInst.due_date);
            const newDate = addMonths(lastDate, -installmentsSaved);
            setSimResult({
                interestSaving,
                installmentsSaved,
                newBalance,
                newEndDate: format(isAfter(newDate, new Date()) ? newDate : new Date(), "MM/yyyy")
            });
        }
    };

    const handleFullQuitacao = async () => {
        if (!selectedDebt || !payAccountId) {
            toast.error("Selecione uma conta para o pagamento.");
            return;
        }

        const pending = installments.filter(i => i.debt_id === selectedDebt.id && i.status !== "paid");
        if (pending.length === 0) {
            toast.info("Dívida já está totalmente paga.");
            return;
        }

        const totalRemaining = pending.reduce((acc, i) => acc + Number(i.amount), 0);

        if (!confirm(`Deseja quitar as ${pending.length} parcelas restantes desta dívida?\nValor total: ${fmt(totalRemaining)}`)) return;

        setIsPaying(true);
        try {
            // 1. Transaction
            const tData = await insertTransaction.mutateAsync({
                description: `Quitação Total: ${selectedDebt.description}`,
                amount: totalRemaining,
                type: "expense",
                category: "dividas",
                date: format(new Date(), "yyyy-MM-dd"),
                account_id: payAccountId,
                status: "realizadas"
            });

            // 2. Bulk update current installments (loop for simplicity with hook, or direct supabase)
            // Using loop to ensure hooks/cache invalidation work as expected
            for (const inst of pending) {
                await updateInstallment.mutateAsync({
                    id: inst.id,
                    updates: { status: "paid", transaction_id: tData[0].id }
                });
            }

            // 3. Update debt status
            await updateDebt.mutateAsync({
                id: selectedDebt.id,
                updates: { status: "paid" }
            });

            toast.success("Toda a dívida foi quitada!");
            setIsDetailOpen(false);
        } catch (e: any) {
            toast.error("Erro ao quitar: " + e.message);
        } finally {
            setIsPaying(false);
        }
    };

    const handleUndoPaid = async (inst: Installment) => {
        try {
            await updateInstallment.mutateAsync({
                id: inst.id,
                updates: { status: "pending", transaction_id: null }
            });
            toast.success("Parcela desmarcada.");
        } catch { toast.error("Erro ao atualizar."); }
    };

    const handleDeleteDebt = async (id: string) => {
        if (!confirm("Excluir esta dívida e todas as suas parcelas? Isso não removerá transações já existentes no extrato.")) return;
        try {
            await deleteDebt.mutateAsync(id);
            setIsDetailOpen(false);
            toast.success("Dívida excluída.");
        } catch { toast.error("Erro ao excluir."); }
    };

    // ─────── Debt card helper ────────────────────────────────────────
    const dInstallments = (id: string) => installments.filter(i => i.debt_id === id);

    // ─────── Render ──────────────────────────────────────────────────
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-500 pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dívidas e Empréstimos</h1>
                        <p className="text-sm text-muted-foreground mt-1">Gerencie seus compromissos financeiros e planeje sua quitação.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 gap-2 font-semibold text-sm">
                            <Info className="w-4 h-4" /> Guia
                        </Button>
                        <Button className="bg-[#2D9B73] hover:bg-[#258563] text-white rounded-xl gap-2 font-bold shadow-sm text-sm" onClick={openAddModal}>
                            <Plus className="w-4 h-4" /> Nova Dívida
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Dívidas Ativas", value: debts.filter(d => d.status === "active").length, isCur: false, color: "text-slate-800", bg: "bg-white" },
                        { label: "Saldo Devedor", value: stats.saldo, isCur: true, color: "text-[#D94E38]", bg: "bg-[#FFF5F3]" },
                        { label: "Total Pago", value: stats.pago, isCur: true, color: "text-[#2D9B73]", bg: "bg-[#F3FAF7]" },
                        { label: "Juros Pagos", value: stats.juros, isCur: true, color: "text-orange-500", bg: "bg-[#FFF9F2]" },
                    ].map(c => (
                        <div key={c.label} className={cn("rounded-2xl border border-border/50 p-5 shadow-sm flex flex-col gap-1.5 transition-all hover:shadow-md", c.bg)}>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{c.label}</span>
                            <span className={cn("text-xl font-black tracking-tight", c.color)}>
                                {c.isCur ? fmt(c.value as number) : c.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Progress banner */}
                {debts.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                            <span>Progresso</span>
                            <span>{stats.total > 0 ? Math.round((stats.pago / stats.total) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#2D9B73] rounded-full transition-all"
                                style={{ width: `${stats.total > 0 ? (stats.pago / stats.total) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[12px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {nextInstallment
                                    ? `Próxima parcela: ${format(new Date(nextInstallment.due_date + "T00:00:00"), "dd/MM/yyyy")} – ${fmt(nextInstallment.amount)}`
                                    : "Nenhuma parcela pendente"}
                            </span>
                            {freedDate && <span>Livre de dívidas em: {freedDate}</span>}
                        </div>
                    </div>
                )}

                {/* Alert: installments due soon */}
                {soonInstallments.length > 0 && (
                    <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📅</span>
                            <p className="text-sm font-bold text-amber-700">
                                {soonInstallments.length} parcela{soonInstallments.length > 1 ? "s" : ""} vence{soonInstallments.length > 1 ? "m" : ""} em breve ou está atrasada.
                            </p>
                        </div>
                        <Button variant="ghost" className="text-amber-700 font-bold text-xs" onClick={() => {
                            // Logic to filter list or scroll
                        }}>Ver todas</Button>
                    </div>
                )}

                {/* Highlight: Highest interest rate */}
                {debts.length > 0 && debts.some(d => (d.interest_rate ?? 0) > 0) && (() => {
                    const topDebt = [...debts].sort((a, b) => (b.interest_rate ?? 0) - (a.interest_rate ?? 0))[0];
                    return (
                        <div className="bg-[#F3FAF7] border border-[#2D9B73]/20 rounded-2xl p-4 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-[#2D9B73]" />
                            <p className="text-sm font-medium text-slate-700">
                                Maior taxa de juros: <span className="font-black text-slate-800">{topDebt.description}</span> ({topDebt.interest_rate}% {topDebt.interest_rate_type === 'anual' ? 'a.a.' : 'a.m.'})
                            </p>
                        </div>
                    );
                })()}

                {/* Debt list */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                    <div className="flex items-center justify-between px-6 pt-5 pb-3">
                        <h3 className="font-bold text-slate-800 tracking-tight">Minhas Dívidas</h3>
                        <Button variant="ghost" className="text-xs font-bold text-slate-400 gap-1.5 h-8">
                            <Search className="w-3.5 h-3.5" /> Buscar
                        </Button>
                    </div>

                    {loadDebts || loadInstall ? (
                        <div className="flex items-center justify-center py-20 text-slate-400 text-sm italic">Carregando dívidas...</div>
                    ) : debts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 7h20L12 2z" />
                                </svg>
                            </div>
                            <h4 className="text-base font-black text-slate-700 mb-1">Nenhuma dívida cadastrada</h4>
                            <p className="text-sm font-semibold text-[#2D9B73] mb-6">Cadastre suas dívidas para ter controle total do que você deve.</p>
                            <Button className="bg-[#2D9B73] hover:bg-[#258563] text-white rounded-xl px-8 font-bold shadow-sm gap-2 text-sm" onClick={openAddModal}>
                                <Plus className="w-4 h-4" /> Cadastrar Primeira Dívida
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-8 pt-2">
                            {debts.map(debt => {
                                const dis = dInstallments(debt.id);
                                const paid = dis.filter(i => i.status === "paid").length;
                                const total = Number(debt.installments_count);
                                const paidAmt = dis.filter(i => i.status === "paid").reduce((a, b) => a + Number(b.amount), 0);

                                // Se não tem parcelas, o total da dívida é o valor original cadastrado
                                const totalAmt = dis.length > 0 ? dis.reduce((a, b) => a + Number(b.amount), 0) : Number(debt.total_value);
                                const saldoAmt = totalAmt - paidAmt;
                                const progress = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;
                                const nextI = [...dis].filter(i => i.status !== "paid").sort((a, b) => a.due_date.localeCompare(b.due_date))[0];

                                return (
                                    <div
                                        key={debt.id}
                                        className="group bg-white border border-slate-100 rounded-2xl p-4 cursor-pointer hover:border-[#2D9B73]/40 hover:shadow-md transition-all relative"
                                        onClick={() => { setSelectedDebt(debt); setDetailTab("resumo"); setIsDetailOpen(true); }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
                                                    {typeEmoji(debt.category)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-[14px] leading-tight group-hover:text-[#2D9B73] transition-colors">{debt.description}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[11px] font-semibold text-slate-400">{debt.responsible || "Credor não informado"}</p>
                                                        {debt.interest_rate > 0 && (
                                                            <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                                <TrendingUp className="w-2.5 h-2.5" />
                                                                {debt.interest_rate}% {debt.interest_rate_type === 'anual' ? 'a.a.' : 'a.m.'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-[#2D9B73] group-hover:translate-x-0.5 transition-all" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo devedor</p>
                                                <p className="text-[15px] font-black text-[#D94E38] tracking-tight">{fmt(saldoAmt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Valor Parcela</p>
                                                <p className="text-[15px] font-black text-slate-700 tracking-tight">{fmt(Number(debt.installment_value || (totalAmt / total)))}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                                <span>Progresso</span>
                                                <span className="text-[#2D9B73]">{paid}/{total} parcelas ({Math.round(progress)}%)</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                                <div className="h-full bg-[#2D9B73] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                {nextI && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                        <Clock className="w-3 h-3 text-amber-500" />
                                                        Próx: {format(new Date(nextI.due_date + "T00:00:00"), "dd/MM")}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-300 uppercase">
                                                    {debt.frequency || 'Mensal'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── ONBOARDING MODAL ── */}
            <Dialog open={isOnboardingOpen} onOpenChange={handleOnboardingClose}>
                <DialogContent className="sm:max-w-[460px] p-0 border-none bg-white rounded-3xl overflow-hidden shadow-2xl">
                    <div className="px-8 pt-10 pb-8">
                        <DialogClose className="absolute right-5 top-5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <Plus className="w-4 h-4 rotate-45 text-slate-400" />
                        </DialogClose>
                        <div className="text-center mb-7">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-2xl">🚀</span>
                                <h2 className="text-[18px] font-black text-slate-800">Nova página: Minhas Dívidas</h2>
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed">
                                Agora você pode gerenciar todas as suas dívidas de forma inteligente e visual.
                            </p>
                        </div>
                        <div className="space-y-5 mb-8">
                            {[
                                { icon: <BarChart3 className="w-4 h-4" />, title: "Controle total", desc: "Cadastre empréstimos, financiamentos, consórcios e outras dívidas em um só lugar." },
                                { icon: <Calendar className="w-4 h-4" />, title: "Parcelas automáticas", desc: "Acompanhe parcelas pagas, pendentes e atrasadas com lançamento automático no extrato." },
                                { icon: <Banknote className="w-4 h-4" />, title: "Simulador de quitação", desc: "Simule pagamentos extras e veja quanto economiza em juros antecipando parcelas." },
                                { icon: <TrendingUp className="w-4 h-4" />, title: "Visão do progresso", desc: "Veja quanto já pagou, o saldo devedor e a previsão de quando ficará livre das dívidas." },
                            ].map(f => (
                                <div key={f.title} className="flex gap-4 items-start">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">{f.icon}</div>
                                    <div>
                                        <p className="text-[14px] font-black text-slate-800 leading-tight">{f.title}</p>
                                        <p className="text-[12px] font-semibold text-slate-400 leading-snug mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2.5 mb-4 group cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                                dontShowAgain ? "bg-[#2D9B73] border-[#2D9B73]" : "border-slate-300"
                            )}>
                                {dontShowAgain && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-[12px] font-semibold text-slate-400">Não mostrar novamente</span>
                        </div>
                        <Button className="w-full h-12 bg-[#2D9B73] hover:bg-[#258563] text-white rounded-2xl text-[15px] font-black shadow-lg shadow-emerald-200/60"
                            onClick={() => {
                                if (dontShowAgain) localStorage.setItem("hide_debts_onboarding", "true");
                                setIsOnboardingOpen(false);
                            }}>
                            Entendi, vamos lá! 🚀
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── ADD DEBT MODAL ── */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 border-none bg-white rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="px-8 pt-8 pb-8">
                        <DialogClose className="absolute right-5 top-5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors z-10">
                            <Plus className="w-4 h-4 rotate-45 text-slate-400" />
                        </DialogClose>

                        <h2 className="text-[18px] font-black text-slate-800 mb-6">
                            {addStep === 1 ? "Tipo da Dívida" : addStep === 2 ? "Formato da Dívida" : "Detalhes da Dívida"}
                        </h2>

                        {/* STEP 1 */}
                        {addStep === 1 && (
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {debtTypes.map(item => {
                                    const active = debtType === item.id;
                                    return (
                                        <button key={item.id} onClick={() => setDebtType(item.id)}
                                            className={cn("flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl border-2 transition-all",
                                                active ? "bg-[#2D9B73] border-[#2D9B73] text-white shadow-lg shadow-emerald-200/60 font-black"
                                                    : "bg-white border-slate-100 text-slate-700 hover:border-emerald-200 hover:bg-slate-50")}>
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300", active ? "bg-white/20 scale-110" : "bg-amber-50")}>
                                                {item.emoji}
                                            </div>
                                            <span className="text-[13px] font-black leading-tight text-center">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* STEP 2 */}
                        {addStep === 2 && (
                            <div className="space-y-3 mb-8">
                                {[
                                    { id: "fixas", emoji: "📊", title: "Parcelas Fixas", desc: "Sei o valor de cada parcela (ex: 12x de R$ 500)" },
                                    { id: "juros", emoji: "📈", title: "Com Taxa de Juros", desc: "Sei a taxa de juros e quero calcular as parcelas" },
                                ].map(opt => {
                                    const active = debtFormat === opt.id;
                                    return (
                                        <button key={opt.id} onClick={() => setDebtFormat(opt.id)}
                                            className={cn("w-full flex items-center gap-4 px-5 py-5 rounded-2xl border-2 transition-all text-left",
                                                active ? "bg-[#2D9B73] border-[#2D9B73] text-white shadow-lg shadow-emerald-200/60"
                                                    : "bg-white border-slate-100 text-slate-700 hover:border-emerald-200 hover:bg-slate-50")}>
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300", active ? "bg-white/20 scale-110" : "bg-slate-100")}>
                                                {opt.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[15px] font-black">{opt.title}</p>
                                                <p className={cn("text-[12px] font-semibold mt-0.5 leading-snug", active ? "text-white/75" : "text-slate-400")}>{opt.desc}</p>
                                            </div>
                                            {active && <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><Check className="w-4 h-4 text-[#2D9B73]" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* STEP 3 */}
                        {addStep === 3 && (
                            <div className="space-y-4 mb-8">
                                <div className="space-y-1.5">
                                    <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Nome da dívida <span className="text-red-400">*</span></Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Financiamento do carro" className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Credor</Label>
                                    <Input value={creditor} onChange={e => setCreditor(e.target.value)} placeholder="Ex: Banco Itaú" className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Valor total original <span className="text-red-400">*</span></Label>
                                        <Input value={totalValue} onChange={e => setTotalValue(moneyMask(e.target.value))} placeholder="0,00" className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Nº de parcelas <span className="text-red-400">*</span></Label>
                                        <Input type="number" min={1} value={numInstall} onChange={e => setNumInstall(e.target.value)} placeholder="" className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                    </div>
                                </div>

                                {debtFormat === 'fixas' ? (
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Valor de cada parcela <span className="text-red-400">*</span></Label>
                                        <Input value={installVal} onChange={e => setInstallVal(moneyMask(e.target.value))} placeholder="0,00" className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                                                    Taxa de juros (%) <Info className="w-3.5 h-3.5 text-slate-400" />
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={interestRate}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/[^\d,.]/g, "");
                                                        setInterestRate(val);
                                                    }}
                                                    placeholder="2,5"
                                                    className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Tipo da taxa</Label>
                                                <select value={interestRateType} onChange={e => setInterestRateType(e.target.value)}
                                                    className="w-full h-12 rounded-xl border border-slate-200 bg-background px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#2D9B73]/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat">
                                                    <option value="mensal">Mensal</option>
                                                    <option value="anual">Anual</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                                                    Tipo de juros <Info className="w-3.5 h-3.5 text-slate-400" />
                                                </Label>
                                                <select value={interestType} onChange={e => setInterestType(e.target.value)}
                                                    className="w-full h-12 rounded-xl border border-slate-200 bg-background px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#2D9B73]/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat">
                                                    <option value="composto">Composto</option>
                                                    <option value="simples">Simples</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                                                    Sistema <Info className="w-3.5 h-3.5 text-slate-400" />
                                                </Label>
                                                <select value={amortizationSystem} onChange={e => setAmortizationSystem(e.target.value)}
                                                    className="w-full h-12 rounded-xl border border-slate-200 bg-background px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#2D9B73]/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat">
                                                    <option value="price">Price (parcela fixa)</option>
                                                    <option value="sac">SAC (parcela decrescente)</option>
                                                    <option value="simples">Simples (juros sobre o total)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Data da 1ª parcela <span className="text-red-400">*</span></Label>
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Frequência</Label>
                                        <select value={frequency} onChange={e => setFrequency(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-background px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#2D9B73]/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat">
                                            <option value="mensal">Mensal</option>
                                            <option value="quinzenal">Quinzenal</option>
                                            <option value="semanal">Semanal</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Parcelas já pagas antes do cadastro</Label>
                                    <Input type="number" min={0} value={paidBefore} onChange={e => setPaidBefore(e.target.value)} className="h-12 rounded-xl border-slate-200 text-sm font-semibold focus:ring-[#2D9B73]/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">Observações</Label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações opcionais..."
                                        className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-background px-3 py-3 text-sm font-semibold resize-none outline-none focus:ring-2 focus:ring-[#2D9B73]/20" />
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 pt-4">
                            {addStep > 1 && (
                                <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black border-slate-100 text-slate-600 text-[14px]" onClick={() => setAddStep(s => s - 1)}>
                                    Voltar
                                </Button>
                            )}
                            {addStep < 3 ? (
                                <Button className={cn("h-12 bg-[#2D9B73] hover:bg-[#258563] text-white rounded-2xl font-black shadow-lg shadow-emerald-200/50 text-[14px]", addStep > 1 ? "flex-[2]" : "w-full")} onClick={handleNext}>
                                    Próximo
                                </Button>
                            ) : (
                                <Button className="flex-[2] h-12 bg-[#2D9B73] hover:bg-[#258563] text-white rounded-2xl font-black shadow-lg shadow-emerald-200/50 text-[14px]" onClick={handleSave} disabled={saving}>
                                    {saving ? "Salvando…" : "Cadastrar Dívida"}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── DEBT DETAIL MODAL ── */}
            {selectedDebt && (() => {
                const dis = dInstallments(selectedDebt.id);
                const paid = dis.filter(i => i.status === "paid").length;
                const total = Number(selectedDebt.installments_count);
                const paidAmt = dis.filter(i => i.status === "paid").reduce((a, b) => a + Number(b.amount || 0), 0);

                // Fallback: se houver parcelas mas o total somar zero, usa o valor original da dívida
                const sumAmt = dis.reduce((a, b) => a + Number(b.amount || 0), 0);
                const totalAmt = sumAmt > 0 ? sumAmt : Number(selectedDebt.total_value || 0);
                const saldoAmt = totalAmt - paidAmt;
                const progress = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;

                return (
                    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                        <DialogContent className="sm:max-w-[500px] p-0 border-none bg-white rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4 flex-shrink-0 relative">
                                <DialogClose className="absolute right-5 top-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors z-20">
                                    <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                                </DialogClose>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">
                                        {typeEmoji(selectedDebt.category)}
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-black text-slate-800 leading-tight">{selectedDebt.description}</h2>
                                        <p className="text-[13px] font-bold text-slate-400">{selectedDebt.responsible || "Credor não informado"}</p>
                                    </div>
                                </div>
                                {/* Tabs */}
                                <div className="flex bg-slate-100/80 rounded-2xl p-1 mt-6 border border-slate-100">
                                    {(["resumo", "parcelas"] as const).map(tab => (
                                        <button key={tab} onClick={() => setDetailTab(tab)}
                                            className={cn("flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all capitalize",
                                                detailTab === tab ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}>
                                            {tab === 'resumo' ? 'Resumo' : 'Parcelas'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="overflow-y-auto flex-1 px-8 pb-8 custom-scrollbar pt-2">
                                {detailTab === "resumo" && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {/* Progress Bar Larger */}
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-[12px] font-black text-slate-500 uppercase tracking-tighter">
                                                <span>Progresso da quitação</span><span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                <div className="h-full bg-[#2D9B73] rounded-full shadow-[0_0_10px_rgba(45,155,115,0.3)] transition-all duration-700" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                        {/* Stats grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: "Valor Original", value: fmt(Number(selectedDebt.total_value)), color: "text-slate-800", icon: <DollarSign className="w-3.5 h-3.5" /> },
                                                { label: "Saldo Devedor", value: fmt(saldoAmt || Number(selectedDebt.total_value)), color: "text-[#D94E38]", icon: <TrendingDown className="w-3.5 h-3.5" /> },
                                                { label: "Total Pago", value: fmt(paidAmt), color: "text-[#2D9B73]", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                                                {
                                                    label: "Juros Pagos",
                                                    value: fmt(Math.max(0, paidAmt - (Number(selectedDebt.total_value) * (paid / (total || 1))))),
                                                    color: "text-orange-500",
                                                    icon: <TrendingUp className="w-3.5 h-3.5" />
                                                },
                                            ].map(s => (
                                                <div key={s.label} className="bg-slate-50/50 border border-slate-100 rounded-[20px] p-5 hover:bg-white hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-1.5 mb-2 text-slate-400 font-bold uppercase text-[9px]">
                                                        {s.icon} {s.label}
                                                    </div>
                                                    <p className={cn("text-[17px] font-black tracking-tight", s.color)}>{s.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1.5 pt-2">
                                            <p className="text-[13px] font-bold text-slate-500">Parcelas: {paid}/{total}</p>
                                            {Number(selectedDebt.interest_rate) > 0 && (
                                                <>
                                                    <p className="text-[13px] font-bold text-slate-500">Taxa: {selectedDebt.interest_rate}% {selectedDebt.interest_rate_type === 'anual' ? 'a.a.' : 'a.m.'}</p>
                                                    <p className="text-[13px] font-bold text-slate-500">Sistema: {selectedDebt.amortization_system === 'sac' ? 'SAC' : 'Price'}</p>
                                                </>
                                            )}
                                            <p className="text-[13px] font-bold text-slate-500">Tipo: {typeLabel(selectedDebt.category)}</p>
                                        </div>
                                    </div>
                                )}

                                {detailTab === "parcelas" && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {dis.sort((a, b) => a.installment_number - b.installment_number).map(inst => (
                                            <div key={inst.id}
                                                className={cn(
                                                    "flex items-center gap-4 border rounded-[22px] px-5 py-4 transition-all group",
                                                    inst.status === "paid" ? "bg-slate-50/50 border-slate-100 opacity-80" : "bg-white border-slate-100 hover:border-[#2D9B73]/30 hover:shadow-sm"
                                                )}
                                            >
                                                <button
                                                    onClick={() => handleMarkPaidClick(inst)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                        inst.status === "paid"
                                                            ? "bg-[#2D9B73] border-[#2D9B73] text-white"
                                                            : "border-slate-200 text-transparent hover:border-[#2D9B73]"
                                                    )}
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[14px] font-black text-slate-800">#{inst.installment_number}</span>
                                                        <span className="text-[12px] font-bold text-slate-500">
                                                            {format(new Date(inst.due_date + "T00:00:00"), "dd/MM/yyyy")}
                                                        </span>
                                                        <div className={cn(
                                                            "text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tight",
                                                            inst.status === "paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                : inst.status === "overdue" ? "bg-red-50 text-red-600 border border-red-100"
                                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                                        )}>
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", inst.status === 'paid' ? 'bg-emerald-600' : inst.status === 'overdue' ? 'bg-red-600' : 'bg-slate-500')} />
                                                            {inst.status === "paid" ? "Pago" : inst.status === "overdue" ? "Atrasado" : "Pendente"}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-1 gap-2 border-t border-slate-50 pt-1.5">
                                                        <span>Total: {fmt(inst.amount)}</span>
                                                        {(() => {
                                                            const brk = installmentBreakdown[inst.installment_number];
                                                            if (!brk || Number(selectedDebt?.interest_rate) === 0) return null;
                                                            return (
                                                                <>
                                                                    <span>Juros: {fmt(brk.interest)}</span>
                                                                    <span>Amort: {fmt(brk.amortization)}</span>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer actions */}
                            <div className="px-8 pb-8 pt-3 flex gap-3 flex-shrink-0 bg-white">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-[18px] font-black text-slate-700 text-[14px] gap-2 border-slate-200 shadow-sm hover:bg-slate-50"
                                    onClick={() => setIsSimModalOpen(true)}
                                    disabled={isPaying}
                                >
                                    <Calculator className="w-4 h-4 text-[#2D9B73]" /> Simular Quitação
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-12 h-12 rounded-[18px] p-0 flex-shrink-0 border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors shadow-sm"
                                    onClick={() => handleDeleteDebt(selectedDebt.id)}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            })()}

            {/* ── QUITAÇÃO SIMULATOR MODAL ── */}
            <Dialog open={isSimModalOpen} onOpenChange={setIsSimModalOpen}>
                <DialogContent className="sm:max-w-[440px] p-0 border-none bg-white rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="px-8 pt-8 pb-8">
                        {selectedDebt && (() => {
                            const pending = installments.filter(i => i.debt_id === selectedDebt.id && i.status !== 'paid');
                            const currentBalance = pending.reduce((acc, i) => acc + Number(i.amount || 0), 0);

                            return (
                                <>
                                    <DialogHeader className="mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                                <Calculator className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <DialogTitle className="text-[18px] font-black text-slate-800">Simulador de Quitação</DialogTitle>
                                                <p className="text-[13px] font-bold text-slate-400">
                                                    {selectedDebt.description} — Saldo: {fmt(currentBalance)}
                                                </p>
                                            </div>
                                        </div>
                                    </DialogHeader>
                                </>
                            );
                        })()}

                        {/* Tabs Style */}
                        <div className="flex bg-slate-100/60 rounded-2xl p-1 mb-8">
                            <button
                                onClick={() => setSimTab("extra")}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl text-[13px] font-black transition-all",
                                    simTab === "extra" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Pagamento Extra
                            </button>
                            <button
                                onClick={() => setSimTab("full")}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl text-[13px] font-black transition-all",
                                    simTab === "full" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Quitar Tudo
                            </button>
                        </div>

                        {simTab === "extra" ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[13px] font-bold text-slate-500 uppercase tracking-tight">Valor do pagamento extra</Label>
                                    <Input
                                        value={extraPayVal}
                                        onChange={e => setExtraPayVal(moneyMask(e.target.value))}
                                        placeholder="R$ 0,00"
                                        className="h-16 rounded-2xl border-slate-200 text-xl font-black text-slate-700 bg-slate-50/30 focus:bg-white transition-all shadow-inner border-2"
                                    />
                                </div>
                                <Button
                                    onClick={handleSimulateExtra}
                                    className="w-full h-14 bg-[#2D9B73] hover:bg-[#258563] text-white rounded-[22px] font-black shadow-lg shadow-emerald-200/50 text-[15px] gap-2"
                                >
                                    <Calculator className="w-5 h-5" /> Simular
                                </Button>

                                {simResult && (
                                    <div className="bg-emerald-50/30 border border-emerald-100 rounded-[28px] p-6 space-y-5 animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center gap-2 text-emerald-700">
                                            <BarChart3 className="w-5 h-5" />
                                            <h3 className="font-black text-[15px]">Resultado da Simulação</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-left">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-tight">
                                                    <DollarSign className="w-3.5 h-3.5" /> Economia em juros
                                                </div>
                                                <p className="text-[15px] font-black text-[#2D9B73]">{fmt(simResult.interestSaving)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-tight">
                                                    <Calendar className="w-3.5 h-3.5" /> Parcelas economizadas
                                                </div>
                                                <p className="text-[15px] font-black text-[#2D9B73]">{simResult.installmentsSaved} parcelas</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-tight">
                                                    <TrendingDown className="w-3.5 h-3.5" /> Novo saldo
                                                </div>
                                                <p className="text-[15px] font-black text-slate-700">{fmt(simResult.newBalance)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-tight">
                                                    <Clock className="w-3.5 h-3.5" /> Nova data final
                                                </div>
                                                <p className="text-[15px] font-black text-slate-700">{simResult.newEndDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 pt-2 border-t border-emerald-100/50 text-left">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] font-bold text-slate-400 italic leading-tight">
                                                Esta é apenas uma simulação. Nenhum dado foi alterado.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-8 text-center space-y-2">
                                    <p className="text-[13px] font-bold text-slate-500 uppercase">Valor para quitar hoje</p>
                                    <p className="text-[32px] font-black text-[#2D9B73] tracking-tighter">
                                        {selectedDebt && fmt(installments.filter(i => i.debt_id === selectedDebt.id && i.status !== 'paid').reduce((acc, i) => acc + Number(i.amount || 0), 0))}
                                    </p>
                                    <p className="text-[12px] font-bold text-slate-400">Sem juros futuros</p>
                                </div>
                                <Button
                                    onClick={handleFullQuitacao}
                                    className="w-full h-14 bg-[#2D9B73] hover:bg-[#258563] text-white rounded-[22px] font-black shadow-lg shadow-emerald-200/50 text-[15px] gap-2"
                                >
                                    <Calculator className="w-5 h-5" /> Ver Economia
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── PAYMENT MODAL ── */}
            <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                <DialogContent className="sm:max-w-[420px] p-0 border-none bg-white rounded-[28px] overflow-hidden shadow-2xl">
                    <div className="px-8 pt-8 pb-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-[18px] font-black text-slate-800 text-center">Registrar Pagamento</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-wider mb-1">Valor do pagamento</p>
                                <p className="text-[28px] font-black text-[#2D9B73] tracking-tighter">{fmt(selectedInst?.amount || 0)}</p>
                                {selectedDebt && (
                                    <p className="text-[12px] font-bold text-slate-500 mt-2">
                                        Parcela {selectedInst?.installment_number}/{selectedDebt?.installments_count} – {selectedDebt?.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold text-slate-500 uppercase">Conta para débito</Label>
                                <Select value={payAccountId} onValueChange={setPayAccountId}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-semibold focus:ring-[#2D9B73]/20">
                                        <SelectValue placeholder="Selecione uma conta" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id} className="font-semibold text-sm rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black text-slate-600 border-slate-100" onClick={() => setIsPayModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                className="flex-[2] h-12 bg-[#2D9B73] hover:bg-[#258563] text-white rounded-2xl font-black shadow-lg shadow-emerald-200/50"
                                onClick={handleConfirmPayment}
                                disabled={isPaying || !payAccountId}
                            >
                                {isPaying ? "Pagando..." : "Confirmar Pagamento"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #e2e8f0;
                }
            `}</style>
        </MainLayout>
    );
}
