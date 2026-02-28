import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PiggyBank,
    TrendingUp,
    Plus,
    ArrowDownLeft,
    CalendarIcon,
    BarChart3,
    Briefcase,
    Coins,
    FileText,
    Home,
    Folder,
    Trash2,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { useSupabaseData, useSupabaseInsert, useSupabaseDelete } from "@/hooks/useSupabase";
import { toast } from "sonner";

interface Investment {
    id: string;
    description: string;
    value: number;
    category: string;
    date: string;
    type: 'aporte' | 'retirada';
    responsible: string;
}

const Investimentos = () => {
    const [isAporteModalOpen, setIsAporteModalOpen] = useState(false);
    const [isRetiradaModalOpen, setIsRetiradaModalOpen] = useState(false);

    const { data: profiles } = useSupabaseData("profiles");
    const userProfile = profiles && (profiles as any[]).length > 0 ? (profiles as any)[0] : null;
    const userName = userProfile?.full_name || userProfile?.nome || "Usuário";

    // Supabase Hooks
    const { data: investmentsData, isLoading: isLoadingInvestments } = useSupabaseData("investments");
    const insertInvestment = useSupabaseInsert("investments");
    const deleteInvestment = useSupabaseDelete("investments");

    // Form states for Aporte
    const [formDescription, setFormDescription] = useState("");
    const [formValue, setFormValue] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formResponsible, setFormResponsible] = useState("");

    // Form states for Retirada
    const [retiradaDescription, setRetiradaDescription] = useState("");
    const [retiradaValue, setRetiradaValue] = useState("");
    const [retiradaCategory, setRetiradaCategory] = useState("");
    const [retiradaResponsible, setRetiradaResponsible] = useState("");

    useEffect(() => {
        if (userName !== "Usuário") {
            setFormResponsible(userName);
            setRetiradaResponsible(userName);
        }
    }, [userName]);

    const transactions = (investmentsData as Investment[]) || [];
    const totalInvested = transactions.reduce((acc, curr) => curr.type === 'aporte' ? acc + Number(curr.value) : acc - Number(curr.value), 0);
    const totalAportes = transactions.filter(t => t.type === 'aporte').reduce((acc, curr) => acc + Number(curr.value), 0);

    // Group balances by category for the withdrawal dropdown
    const balancesByCategory = transactions.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = 0;
        if (curr.type === 'aporte') acc[curr.category] += Number(curr.value);
        else acc[curr.category] -= Number(curr.value);
        return acc;
    }, {} as Record<string, number>);

    const availableCategoriesForWithdrawal = Object.entries(balancesByCategory).filter(([_, balance]) => balance > 0);

    // Mock data for charts
    const chartData = [
        { name: 'Jan/26', value: 0 },
        { name: 'Fev/26', value: totalInvested },
    ];

    const categoryOptions = [
        { value: "renda-fixa", label: "Renda Fixa", icon: BarChart3 },
        { value: "acoes", label: "Ações", icon: TrendingUp },
        { value: "fundos", label: "Fundos", icon: Briefcase },
        { value: "cripto", label: "Criptomoedas", icon: Coins },
        { value: "previdencia", label: "Previdência", icon: FileText },
        { value: "imoveis", label: "Imóveis", icon: Home },
        { value: "outros", label: "Outros", icon: Folder },
    ];

    const getCategoryIcon = (value: string) => {
        const option = categoryOptions.find(opt => opt.value === value);
        return option ? option.icon : Folder;
    };

    const getCategoryLabel = (value: string) => {
        const option = categoryOptions.find(opt => opt.value === value);
        return option ? option.label : "Outros";
    }

    const handleSaveAporte = async () => {
        if (!formDescription || !formValue || !formCategory) {
            toast.error("Por favor, preencha os campos obrigatórios.");
            return;
        }

        // Parsing robusto: Remove R$, espaços e ajusta separadores
        let cleanValue = formValue.replace(/R\$/g, "").trim();
        let numericValue: number;

        if (cleanValue.includes(",") && cleanValue.includes(".")) {
            // Caso: 1.234,56 (Brasileiro com ponto de milhar)
            numericValue = parseFloat(cleanValue.replace(/\./g, "").replace(",", "."));
        } else if (cleanValue.includes(",")) {
            // Caso: 1234,56 (Brasileiro sem ponto ou só vírgula)
            numericValue = parseFloat(cleanValue.replace(",", "."));
        } else {
            // Caso: 1234.56 ou 1.234.56 (Assume que o último ponto ou a falta de vírgula indica padrão global)
            // Se tiver múltiplos pontos, remove todos exceto o último se ele parecer um decimal
            const parts = cleanValue.split('.');
            if (parts.length > 2) {
                numericValue = parseFloat(cleanValue.replace(/\./g, ""));
            } else {
                numericValue = parseFloat(cleanValue);
            }
        }

        try {
            await insertInvestment.mutateAsync({
                description: formDescription,
                value: isNaN(numericValue) ? 0 : numericValue,
                category: formCategory,
                date: format(new Date(), "yyyy-MM-dd"),
                type: 'aporte',
                responsible: formResponsible
            });

            toast.success("Aporte registrado com sucesso!");
            setIsAporteModalOpen(false);
            setFormDescription("");
            setFormValue("");
            setFormCategory("");
        } catch (error: any) {
            console.error("Erro detalhado do Supabase:", error);
            const detail = error.message || error.details || "Erro desconhecido";
            toast.error(`Erro ao registrar aporte: ${detail}`);
        }
    };

    const handleSaveRetirada = async () => {
        if (!retiradaDescription || !retiradaValue || !retiradaCategory) {
            toast.error("Por favor, preencha os campos obrigatórios.");
            return;
        }

        // Mesmo parsing robusto para retirada
        let cleanValue = retiradaValue.replace(/R\$/g, "").trim();
        let numericValue: number;
        if (cleanValue.includes(",") && cleanValue.includes(".")) {
            numericValue = parseFloat(cleanValue.replace(/\./g, "").replace(",", "."));
        } else if (cleanValue.includes(",")) {
            numericValue = parseFloat(cleanValue.replace(",", "."));
        } else {
            const parts = cleanValue.split('.');
            numericValue = parts.length > 2 ? parseFloat(cleanValue.replace(/\./g, "")) : parseFloat(cleanValue);
        }
        const currentBalance = balancesByCategory[retiradaCategory] || 0;

        if (numericValue > currentBalance) {
            toast.error("Valor da retirada excede o saldo disponível nesta categoria.");
            return;
        }

        try {
            await insertInvestment.mutateAsync({
                description: retiradaDescription,
                value: isNaN(numericValue) ? 0 : numericValue,
                category: retiradaCategory,
                date: format(new Date(), "yyyy-MM-dd"),
                type: 'retirada',
                responsible: retiradaResponsible
            });

            toast.success("Retirada registrada com sucesso!");
            setIsRetiradaModalOpen(false);
            setRetiradaDescription("");
            setRetiradaValue("");
            setRetiradaCategory("");
        } catch (error: any) {
            console.error("Erro detalhado do Supabase:", error);
            const detail = error.message || error.details || "Erro desconhecido";
            toast.error(`Erro ao registrar retirada: ${detail}`);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteInvestment.mutateAsync(id);
            toast.success("Movimentação excluída com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir movimentação.");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Summary Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#E7F6F2] border border-[#A7D7C5] rounded-xl p-6 flex flex-col justify-between h-32">
                            <div className="flex items-start justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Investido</span>
                                <div className="p-2 bg-[#D1EDE6] rounded-lg text-[#2D9B73]">
                                    <PiggyBank className="w-5 h-5" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-[#2D9B73]">
                                {isLoadingInvestments ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)
                                )}
                            </span>
                        </div>

                        <div className="bg-[#E7F6F2] border border-[#A7D7C5] rounded-xl p-6 flex flex-col justify-between h-32">
                            <div className="flex items-start justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Aportes/Mês</span>
                                <div className="p-2 bg-[#D1EDE6] rounded-lg text-[#2D9B73]">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-[#2D9B73]">
                                {isLoadingInvestments ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAportes)
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center gap-4 h-32">
                        {/* Modal Aporte */}
                        <Dialog open={isAporteModalOpen} onOpenChange={setIsAporteModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-[#2D9B73] hover:bg-[#258563] text-white font-medium gap-2 h-10">
                                    <Plus className="w-4 h-4" /> Aporte
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Registrar Aporte</DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Descrição <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="description"
                                            placeholder="Ex: Tesouro Selic"
                                            className="h-10"
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="value" className="text-sm font-medium">
                                            Valor <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="value"
                                            placeholder="R$ 0,00"
                                            className="h-10"
                                            value={formValue}
                                            onChange={(e) => setFormValue(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Categoria <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={formCategory} onValueChange={setFormCategory}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <option.icon className="w-4 h-4" />
                                                            <span>{option.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Data</Label>
                                        <div className="relative">
                                            <Input
                                                value={format(new Date(), "dd/MM/yyyy")}
                                                className="h-10 pl-3 pr-10"
                                                readOnly
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Responsável <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={formResponsible} onValueChange={setFormResponsible}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={userName}>{userName}</SelectItem>
                                                <SelectItem value="Outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <Switch id="repeat" />
                                        <Label htmlFor="repeat" className="text-sm font-medium cursor-pointer">
                                            Repetir mensalmente
                                        </Label>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        className="w-full bg-[#2D9B73] hover:bg-[#258563] text-white h-11"
                                        onClick={handleSaveAporte}
                                        disabled={insertInvestment.isPending}
                                    >
                                        {insertInvestment.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Salvar Aporte
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Modal Retirada */}
                        <Dialog open={isRetiradaModalOpen} onOpenChange={setIsRetiradaModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium gap-2 h-10">
                                    <ArrowDownLeft className="w-4 h-4" /> Retirada
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Registrar Retirada</DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="retirada-desc" className="text-sm font-medium">
                                            Descrição <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="retirada-desc"
                                            placeholder="Ex: Resgate Tesouro"
                                            className="h-10"
                                            value={retiradaDescription}
                                            onChange={(e) => setRetiradaDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            De qual investimento? <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={retiradaCategory} onValueChange={setRetiradaCategory}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCategoriesForWithdrawal.length === 0 ? (
                                                    <SelectItem value="none" disabled>Nenhum saldo disponível</SelectItem>
                                                ) : (
                                                    availableCategoriesForWithdrawal.map(([category, balance]) => {
                                                        const Icon = getCategoryIcon(category);
                                                        return (
                                                            <SelectItem key={category} value={category}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="w-4 h-4" />
                                                                    <span>{getCategoryLabel(category)} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)} disponível</span>
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="retirada-value" className="text-sm font-medium">
                                            Valor <span className="text-red-500">*</span> {retiradaCategory && balancesByCategory[retiradaCategory] ? `(máx: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balancesByCategory[retiradaCategory])})` : ''}
                                        </Label>
                                        <Input
                                            id="retirada-value"
                                            placeholder="R$ 0,00"
                                            className="h-10"
                                            value={retiradaValue}
                                            onChange={(e) => setRetiradaValue(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Data</Label>
                                        <div className="relative">
                                            <Input
                                                value={format(new Date(), "dd/MM/yyyy")}
                                                className="h-10 pl-3 pr-10"
                                                readOnly
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Responsável <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={retiradaResponsible} onValueChange={setRetiradaResponsible}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={userName}>{userName}</SelectItem>
                                                <SelectItem value="Outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        className="w-full bg-[#D94E38] hover:bg-[#C23C26] text-white h-11"
                                        onClick={handleSaveRetirada}
                                        disabled={insertInvestment.isPending}
                                    >
                                        {insertInvestment.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Registrar Retirada
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Evolução Acumulada */}
                    <div className="bg-card rounded-xl border border-border p-6 h-[300px] flex flex-col">
                        <h3 className="text-base font-semibold text-foreground mb-6">Evolução Acumulada</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={true}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 10 }}
                                        allowDataOverflow={false}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 10 }}
                                        tickFormatter={(value) => `R$${value}`}
                                        width={40}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2D9B73"
                                        strokeWidth={2}
                                        dot={{ fill: "#2D9B73", r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Aportes Mensais */}
                    <div className="bg-card rounded-xl border border-border p-6 h-[300px] flex flex-col">
                        <h3 className="text-base font-semibold text-foreground mb-6">Aportes Mensais</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={0} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={true}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 10 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 10 }}
                                        tickFormatter={(value) => `R$${value}`}
                                        width={40}
                                    />
                                    <Bar dataKey="value" fill="#2D9B73" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bg-card rounded-xl border border-border p-6 min-h-[200px]">
                    <h3 className="text-base font-semibold text-foreground mb-6">Movimentações do Mês</h3>

                    <div className="space-y-4">
                        {isLoadingInvestments ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[#2D9B73]" />
                                <p className="text-sm text-muted-foreground">Carregando movimentações...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                                Nenhuma movimentação neste mês
                            </div>
                        ) : (
                            transactions.map((transaction) => {
                                const Icon = getCategoryIcon(transaction.category);
                                return (
                                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-border">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center text-muted-foreground md:text-2xl">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{transaction.description}</h4>
                                                <p className="text-xs text-muted-foreground">{getCategoryLabel(transaction.category)} • {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className={cn(
                                                "font-bold",
                                                transaction.type === 'aporte' ? "text-[#2D9B73]" : "text-destructive"
                                            )}>
                                                {transaction.type === 'aporte' ? "+" : "-"}
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.value)}
                                            </span>
                                            <button
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={() => handleDelete(transaction.id)}
                                                disabled={deleteInvestment.isPending}
                                            >
                                                {deleteInvestment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default Investimentos;

