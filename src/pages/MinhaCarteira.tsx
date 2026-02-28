import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Wallet,
    Plus,
    Pencil,
    Trash2,
    Building2,
    CreditCard,
    Smartphone,
    Coins,
    Landmark,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Check,
    Globe,
    Home,
    Utensils,
    Loader2
} from "lucide-react";
import { useSupabaseData, useSupabaseInsert, useSupabaseDelete } from "@/hooks/useSupabase";
import { toast } from "sonner";

interface Account {
    id: string;
    name: string;
    bank_name: string;
    type: string;
    responsible: string;
    balance: number;
    icon: string;
}

interface FutureTransaction {
    id: string;
    icon: any;
    name: string;
    recurrence: string;
    date: string;
    value: number;
    type: "expense" | "income";
    assignedAccount: string | null;
}

const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case "building": return Building2;
        case "card": return CreditCard;
        case "phone": return Smartphone;
        case "money": return Coins;
        case "landmark": return Landmark;
        default: return Building2;
    }
};

const MinhaCarteira = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);

    // Supabase Hooks
    const { data: accountsData, isLoading: isLoadingAccounts } = useSupabaseData("accounts");
    const insertAccount = useSupabaseInsert("accounts");
    const deleteAccount = useSupabaseDelete("accounts");

    // Form State for new account
    const [newAccountName, setNewAccountName] = useState("");
    const [newAccountBank, setNewAccountBank] = useState("");
    const [newAccountType, setNewAccountType] = useState("");
    const [newAccountResponsible, setNewAccountResponsible] = useState("");

    const { data: profiles } = useSupabaseData("profiles");
    const userProfile = profiles && (profiles as any[]).length > 0 ? (profiles as any)[0] : null;
    const userName = userProfile?.full_name || userProfile?.nome || "Usuário";

    useEffect(() => {
        if (userName !== "Usuário") {
            setNewAccountResponsible(userName);
        }
    }, [userName]);
    const [newAccountBalance, setNewAccountBalance] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<string>("building");

    // State for future transactions (Step 2)
    const [futureTransactions, setFutureTransactions] = useState<FutureTransaction[]>([
        { id: "1", icon: Globe, name: "Internet", recurrence: "mensal", date: "Todo dia 1", value: 100, type: "expense", assignedAccount: null },
        { id: "2", icon: Coins, name: "Salário Liquido", recurrence: "mensal", date: "Todo dia 5", value: 5000, type: "income", assignedAccount: null },
        { id: "3", icon: Home, name: "Aluguel", recurrence: "mensal", date: "Todo dia 15", value: 1200, type: "expense", assignedAccount: null },
        { id: "4", icon: Utensils, name: "VR", recurrence: "mensal", date: "Todo dia 20", value: 600, type: "income", assignedAccount: null },
    ]);

    const [globalAccount, setGlobalAccount] = useState<string>("none");
    const [selectAll, setSelectAll] = useState(false);

    // Computed totals
    const accounts = (accountsData as Account[]) || [];
    const totalBalance = accounts.reduce((acc, account) => acc + Number(account.balance), 0);

    const handleAddAccount = async () => {
        if (!newAccountName || !newAccountBalance) {
            toast.error("Por favor, preencha os campos obrigatórios.");
            return;
        }

        const numericBalance = parseFloat(newAccountBalance.replace("R$", "").replace(".", "").replace(",", ".").trim());

        try {
            await insertAccount.mutateAsync({
                name: newAccountName,
                bank_name: newAccountBank,
                type: newAccountType,
                responsible: newAccountResponsible,
                balance: isNaN(numericBalance) ? 0 : numericBalance,
                icon: selectedIcon
            });

            toast.success("Conta adicionada com sucesso!");
            setIsNewAccountModalOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao adicionar conta.");
        }
    };

    const handleDeleteAccount = async (id: string) => {
        try {
            await deleteAccount.mutateAsync(id);
            toast.success("Conta excluída com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir conta.");
        }
    };

    const resetForm = () => {
        setNewAccountName("");
        setNewAccountBank("");
        setNewAccountType("");
        setNewAccountResponsible("");
        setNewAccountBalance("");
        setSelectedIcon("building");
    };

    const handleGlobalAccountChange = (accountId: string) => {
        setGlobalAccount(accountId);
        if (accountId !== "none" && selectAll) {
            setFutureTransactions(futureTransactions.map(t => ({ ...t, assignedAccount: accountId })));
        }
    };

    const handleSelectAllChange = (checked: boolean) => {
        setSelectAll(checked);
        if (checked && globalAccount !== "none") {
            setFutureTransactions(futureTransactions.map(t => ({ ...t, assignedAccount: globalAccount })));
        }
    }

    const handleTransactionAccountChange = (transactionId: string, accountId: string) => {
        setFutureTransactions(futureTransactions.map(t =>
            t.id === transactionId ? { ...t, assignedAccount: accountId } : t
        ));
    };

    // Render Steps
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="text-sm font-medium text-[#2D9B73]">Passo 1 de 3</div>
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Wallet className="w-6 h-6 text-[#2D9B73]" />
                    Configurar Minha Carteira
                </h1>
                <p className="text-muted-foreground">Cadastre suas contas bancárias com o saldo atual de cada uma.</p>
            </div>

            <div className="space-y-4">
                {isLoadingAccounts ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2D9B73]" />
                        <p className="text-sm text-muted-foreground">Carregando suas contas...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl border-border">
                        <p className="text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
                    </div>
                ) : (
                    accounts.map(account => {
                        const IconComp = getIconComponent(account.icon);
                        return (
                            <div key={account.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center">
                                        <IconComp className="w-6 h-6 text-[#2D9B73]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{account.name}</h3>
                                        <p className="text-xs text-muted-foreground">{account.bank_name} • {account.responsible}</p>
                                        <p className="font-bold text-lg mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAccount(account.id)}
                                        disabled={deleteAccount.isPending}
                                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors text-destructive disabled:opacity-50"
                                    >
                                        {deleteAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}

                <Dialog open={isNewAccountModalOpen} onOpenChange={setIsNewAccountModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed h-12 gap-2 text-muted-foreground hover:text-foreground">
                            <Plus className="w-4 h-4" /> Adicionar Conta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Nova Conta Bancária</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Ícone</Label>
                                <div className="flex items-center gap-2">
                                    {['building', 'card', 'phone', 'money', 'landmark'].map(icon => {
                                        const IconComp = getIconComponent(icon);
                                        return (
                                            <button
                                                key={icon}
                                                onClick={() => setSelectedIcon(icon)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${selectedIcon === icon ? 'bg-[#2D9B73]/10 border-[#2D9B73] text-[#2D9B73]' : 'border-border hover:bg-muted'}`}
                                            >
                                                <IconComp className="w-5 h-5" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nome da Conta *</Label>
                                <Input placeholder="Ex: Nubank, Itaú, Carteira" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Nome do Banco</Label>
                                <Input placeholder="Ex: Banco do Brasil" value={newAccountBank} onChange={e => setNewAccountBank(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Conta</Label>
                                <Select value={newAccountType} onValueChange={setNewAccountType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                                        <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                                        <SelectItem value="Carteira">Carteira</SelectItem>
                                        <SelectItem value="Investimento">Investimento</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Responsável *</Label>
                                <Select value={newAccountResponsible} onValueChange={setNewAccountResponsible}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o responsável" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={userName}>{userName}</SelectItem>
                                        <SelectItem value="Outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Saldo Atual na Banco *</Label>
                                <Input placeholder="R$ 0,00" value={newAccountBalance} onChange={e => setNewAccountBalance(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Informe o saldo real que você tem agora nesta conta.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsNewAccountModalOpen(false)}>Cancelar</Button>
                            <Button
                                className="bg-[#2D9B73] hover:bg-[#258563] text-white"
                                onClick={handleAddAccount}
                                disabled={insertAccount.isPending}
                            >
                                {insertAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Total das contas:</span>
                <span className="font-bold text-xl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}</span>
            </div>

            <Button
                className="w-full bg-[#2D9B73] hover:bg-[#258563] text-white h-12 text-lg font-semibold shadow-md"
                onClick={() => setStep(2)}
                disabled={accounts.length === 0}
            >
                Próximo Passo <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="text-sm font-medium text-[#2D9B73]">Passo 2 de 3</div>
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-[#2D9B73]" />
                    Vincular Transações Futuras
                </h1>
                <p className="text-muted-foreground">Selecione de qual conta bancária cada transação futura será paga/recebida.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Input type="checkbox" className="w-4 h-4" checked={selectAll} onChange={e => handleSelectAllChange(e.target.checked)} />
                        <span className="text-sm font-medium">Selecionar todas</span>
                    </div>
                    <div className="h-6 w-px bg-border mx-2"></div>
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Aplicar a todas:</span>
                        <Select value={globalAccount} onValueChange={handleGlobalAccountChange}>
                            <SelectTrigger className="h-9 bg-white">
                                <SelectValue placeholder="Selecione uma conta..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const Icon = getIconComponent(acc.icon);
                                                return <Icon className="w-4 h-4 text-[#2D9B73]" />;
                                            })()}
                                            {acc.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    {futureTransactions.map(transaction => (
                        <div key={transaction.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 w-1/3">
                                <div className="w-2 h-2 rounded-full border border-muted-foreground/30"></div>
                                <div className="w-8 h-8 rounded bg-muted/30 flex items-center justify-center">
                                    <transaction.icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{transaction.name} <span className="font-normal text-muted-foreground text-xs">({transaction.recurrence})</span></p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Check className="w-3 h-3" />
                                        {transaction.date}
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/3 flex justify-center">
                                <Select value={transaction.assignedAccount || ""} onValueChange={(val) => handleTransactionAccountChange(transaction.id, val)}>
                                    <SelectTrigger className="w-full bg-muted/10 border-dashed border-muted-foreground/30">
                                        <SelectValue placeholder="Selecione a conta..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const Icon = getIconComponent(acc.icon);
                                                        return <Icon className="w-3 h-3" />;
                                                    })()}
                                                    {acc.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-1/3 text-right">
                                <span className={`font-bold ${transaction.type === 'expense' ? 'text-destructive' : 'text-[#2D9B73]'}`}>
                                    {transaction.type === 'expense' ? '-' : '+'}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.value)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-sm text-blue-700">
                    <div className="mt-0.5">💡</div>
                    <p>Dica: Quando essas transações forem marcadas como pagas, elas vão impactar o saldo da conta selecionada automaticamente.</p>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button className="flex-1 bg-[#2D9B73] hover:bg-[#258563] text-white h-12 font-semibold shadow-md" onClick={() => setStep(3)}>
                    Próximo Passo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="text-sm font-medium text-[#2D9B73]">Passo 3 de 3</div>
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-[#2D9B73]" />
                    Confirme seu Saldo Total
                </h1>
            </div>

            <div className="bg-card/50 border border-[#2D9B73]/30 bg-[#F0FDF4] rounded-2xl p-10 text-center space-y-2">
                <p className="text-muted-foreground font-medium">Saldo total da carteira:</p>
                <h2 className="text-5xl font-bold text-[#2D9B73] tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
                </h2>
                <p className="text-sm text-muted-foreground pt-2">Este valor representa o <span className="font-semibold">marco zero</span> da sua carteira digital.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold mb-4 text-destructive">
                    <span className="text-lg">📌</span> A partir de agora:
                </h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-[#2D9B73]">+</span>
                        <span>Receitas <span className="font-bold">PAGAS</span> aumentam o saldo</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-destructive">-</span>
                        <span>Despesas <span className="font-bold">PAGAS</span> diminuem o saldo</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-muted-foreground">□</span>
                        <span className="text-muted-foreground">Transações <span className="font-bold">PENDENTES</span> não afetam o saldo</span>
                    </li>
                </ul>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Suas contas:</p>
                {accounts.map(acc => {
                    const Icon = getIconComponent(acc.icon);
                    return (
                        <div key={acc.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span>{acc.name}</span>
                            </div>
                            <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}</span>
                        </div>
                    )
                })}
            </div>

            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button className="flex-1 bg-[#2D9B73] hover:bg-[#258563] text-white h-12 font-semibold shadow-md" onClick={() => navigate("/")}>
                    <CheckCircle2 className="mr-2 w-4 h-4" /> Confirmar e Finalizar
                </Button>
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto py-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </MainLayout>
    );
};

export default MinhaCarteira;

