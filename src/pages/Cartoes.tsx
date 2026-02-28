import { useState } from "react";
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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CreditCard,
    Plus,
    ChevronLeft,
    ChevronRight,
    Upload,
    Pencil,
    Trash2,
    FileText,
    CalendarIcon,
    Clock,
    User,
    Check,
    Loader2
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSupabaseData, useSupabaseInsert } from "@/hooks/useSupabase";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

interface Card {
    id: string;
    name: string;
    closingDay: string;
    dueDay: string;
    responsible: string;
    limit: number;
}

const Cartoes = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Fevereiro 2026
    const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Card Form State
    const [cardName, setCardName] = useState("");
    const [dueDay, setDueDay] = useState("");
    const [closingDay, setClosingDay] = useState("");
    const [responsible, setResponsible] = useState("");

    const { data: profiles } = useSupabaseData("profiles");
    const userProfile = profiles && (profiles as any[]).length > 0 ? (profiles as any)[0] : null;
    const userName = userProfile?.full_name || userProfile?.nome || "Usuário";

    // Import Modal State
    const [selectedCardForImport, setSelectedCardForImport] = useState<string | null>(null);
    const [importMonth, setImportMonth] = useState("Fevereiro");
    const [importYear, setImportYear] = useState("2026");
    const [importTotal, setImportTotal] = useState("");
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [transactionsToReview, setTransactionsToReview] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    const [cards, setCards] = useState<Card[]>([]);

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const years = ["2025", "2026", "2027"];

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleAddCard = () => {
        if (!cardName || !dueDay || !closingDay || !responsible) return;

        const newCard: Card = {
            id: Math.random().toString(36).substr(2, 9),
            name: cardName,
            dueDay,
            closingDay,
            responsible,
            limit: 0
        };

        setCards([...cards, newCard]);
        setIsNewCardModalOpen(false);
        resetCardForm();
    };

    const resetCardForm = () => {
        setCardName("");
        setDueDay("");
        setClosingDay("");
        setResponsible("");
    };

    const handleDeleteCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const handleOpenImportModal = (cardId: string) => {
        setSelectedCardForImport(cardId);
        setImportFile(null);
        setImportTotal("");
        setIsImportModalOpen(true);
    };

    const guessCategory = (description: string): string => {
        const desc = description.toLowerCase();

        // Moradia
        if (desc.includes('aluguel') || desc.includes('condominio') || desc.includes('iptu') || desc.includes('luz') || desc.includes('energia') || desc.includes('agua') || desc.includes('gas') || desc.includes('internet')) return 'moradia';

        // Alimentação
        if (desc.includes('ifood') || desc.includes('rappi') || desc.includes('restaur') || desc.includes('lanche') || desc.includes('pizza') || desc.includes('mercado') || desc.includes('supermercado') || desc.includes('padaria') || desc.includes('sacolao') || desc.includes('acougue')) return 'alimentacao';

        // Transporte
        if (desc.includes('uber') || desc.includes('99') || desc.includes('taxi') || desc.includes('metro') || desc.includes('onibus') || desc.includes('posto') || desc.includes('combustivel') || desc.includes('gasolina') || desc.includes('estacionamento') || desc.includes('pedagio')) return 'transporte';

        // Saúde
        if (desc.includes('farmac') || desc.includes('drogaria') || desc.includes('hospital') || desc.includes('clinic') || desc.includes('medic') || desc.includes('odontolog') || desc.includes('exame') || desc.includes('lab')) return 'saude';

        // Educação
        if (desc.includes('mensalidade') || desc.includes('escola') || desc.includes('curso') || desc.includes('faculdade') || desc.includes('livro') || desc.includes('papelaria') || desc.includes('udemy') || desc.includes('hotmart')) return 'educacao';

        // Lazer
        if (desc.includes('cinema') || desc.includes('ingresso') || desc.includes('show') || desc.includes('evento') || desc.includes('bar') || desc.includes('pub') || desc.includes('clube')) return 'lazer';

        // Assinaturas & Streaming
        if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('disney') || desc.includes('hbomax') || desc.includes('starplus') || desc.includes('prime') || desc.includes('youtube') || desc.includes('twitch') || desc.includes('globo')) return 'streaming';
        if (desc.includes('apple') || desc.includes('google') || desc.includes('icloud') || desc.includes('microsoft')) return 'assinaturas';

        // Vestuário
        if (desc.includes('zara') || desc.includes('renner') || desc.includes('marisa') || desc.includes('riachuelo') || desc.includes('hering') || desc.includes('nike') || desc.includes('adidas') || desc.includes('calçado') || desc.includes('roupa')) return 'vestuario';

        // Pet
        if (desc.includes('petshop') || desc.includes('cobasi') || desc.includes('petz') || desc.includes('veterinario') || desc.includes('racao')) return 'pet';

        // Viagens
        if (desc.includes('azul') || desc.includes('latam') || desc.includes('gol') || desc.includes('hotel') || desc.includes('booking') || desc.includes('airbnb') || desc.includes('decolar') || desc.includes('passagem')) return 'viagens';

        // Beleza
        if (desc.includes('salao') || desc.includes('barbearia') || desc.includes('maquiagem') || desc.includes('perfume') || desc.includes('botica') || desc.includes('natura')) return 'beleza';

        // Impostos
        if (desc.includes('iof') || desc.includes('juros') || desc.includes('multa') || desc.includes('taxa') || desc.includes('imposto')) return 'impostos';

        // Dívidas
        if (desc.includes('emprestimo') || desc.includes('financiamento')) return 'dividas';

        // Investimentos
        if (desc.includes('xp ') || desc.includes('btg') || desc.includes('clear') || desc.includes('nu invest') || desc.includes('corretora') || desc.includes('investimento') || desc.includes('aporte')) return 'investimentos';

        // Compras (fallback generalista)
        if (desc.includes('amazon') || desc.includes('mercadolivre') || desc.includes('shopee') || desc.includes('magalu') || desc.includes('americanas')) return 'compras';

        return 'outros-despesas';
    };

    const monthAbbrevToNum: { [key: string]: string } = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
        'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12',
    };

    const normalizeDate = (dateStr: string): string => {
        if (/^\d{1,2}\/\d{1,2}$/.test(dateStr)) return dateStr;
        const match = dateStr.match(/^(\d{1,2})\s+([A-Za-zÀ-ú]+)/);
        if (match) {
            const day = match[1].padStart(2, '0');
            const monthStr = match[2].toLowerCase().slice(0, 3);
            const month = monthAbbrevToNum[monthStr];
            if (month) return `${day}/${month}`;
        }
        return dateStr;
    };

    const parseAmount = (str: string): { value: number; isNegative: boolean } => {
        const isNegative = str.includes('-');
        const cleaned = str.replace(/R\$\s*/g, '').replace(/\s/g, '').replace(/-/g, '').replace(/\./g, '').replace(',', '.');
        return { value: parseFloat(cleaned), isNegative };
    };

    const parsePdfText = (text: string): any[] => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const transactions: any[] = [];
        let idCounter = 0;

        const addTransaction = (date: string, description: string, amountObj: { value: number; isNegative: boolean }) => {
            const { value: amount, isNegative } = amountObj;
            const normDate = normalizeDate(date);
            const descLower = description.toLowerCase();

            // Blacklist of terms that are NOT purchases (usually payments or bank adjustments)
            const blacklist = [
                'pagamento', 'total', 'fatura', 'saldo', 'limite', 'crédito de',
                'ajuste', 'estorno de'
            ];

            const isBlacklisted = blacklist.some(term => descLower.includes(term));

            // On a CC invoice, negative values are usually payments or credits to the bill.
            // We ignore them to avoid false expenses/income.
            if (isNegative || isBlacklisted) return;

            if (!isNaN(amount) && amount > 0 && description.length > 1) {
                idCounter++;
                transactions.push({
                    id: String(Date.now() + idCounter),
                    description: description.trim(),
                    date: normDate,
                    amount,
                    category: guessCategory(description),
                    selected: true
                });
            }
        };

        const amountPattern = /(\d{1,3}(?:\.\d{3})*,\d{2})/;
        const strat1 = /^(\d{1,2}\/\d{1,2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/;
        const strat2 = /^(\d{1,2}\s+[A-Za-zÀ-ú]{3,})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/;
        const strat3 = /^(\d{1,2}[\s/]+\w+)\s+(.+?)\s+R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/;

        for (const line of lines) {
            for (const regex of [strat1, strat2, strat3]) {
                const match = line.match(regex);
                if (match) {
                    addTransaction(match[1], match[2], parseAmount(match[3]));
                    break;
                }
            }
        }

        if (transactions.length === 0) {
            for (let i = 0; i < lines.length - 1; i++) {
                const isDate = lines[i].match(/^(\d{1,2}\/\d{1,2})$/) ||
                    lines[i].match(/^(\d{1,2}\s+[A-Za-zÀ-ú]{3,})$/);
                if (isDate) {
                    const dateStr = isDate[1];
                    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                        const amountMatch = lines[j].match(amountPattern);
                        if (amountMatch) {
                            let desc = lines[j].replace(amountPattern, '').trim();
                            if (desc.length < 2 && j > i + 1) desc = lines[j - 1];
                            if (desc.length > 1) addTransaction(dateStr, desc, parseAmount(amountMatch[1]));
                            break;
                        }
                    }
                }
            }
        }

        if (transactions.length === 0) {
            const broad = /(\d{1,2}[\s/]\d{1,2}|\d{1,2}\s+[A-Za-zÀ-ú]{3,})\s+(.{3,}?)\s+(-?R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}|-?\d{1,3}(?:\.\d{3})*,\d{2})/g;
            let m;
            const joinedText = lines.join('\n');
            while ((m = broad.exec(joinedText)) !== null) {
                addTransaction(m[1], m[2], parseAmount(m[3]));
            }
        }

        return transactions;
    };

    const handleContinueImport = async () => {
        if (!importFile) {
            toast.error("Por favor, selecione um arquivo PDF da fatura.");
            return;
        }

        setIsParsing(true);

        try {
            const arrayBuffer = await importFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const items = textContent.items as any[];
                let lastY: number | null = null;
                let lastX: number | null = null;
                for (const item of items) {
                    const y = item.transform?.[5];
                    const x = item.transform?.[4];
                    if (lastY !== null && Math.abs(y - lastY) > 2) {
                        fullText += '\n';
                        lastX = null;
                    } else if (lastX !== null && x - lastX > 5) {
                        fullText += ' ';
                    }
                    fullText += item.str;
                    lastY = y;
                    lastX = x + (item.width || 0);
                }
                fullText += '\n';
            }

            const extracted = parsePdfText(fullText);

            if (extracted.length > 0) {
                setTransactionsToReview(extracted);
                setIsImportModalOpen(false);
                setIsReviewModalOpen(true);
            } else {
                toast.error("Não foi possível extrair as transações. O PDF pode estar em formato de imagem ou ter uma estrutura diferente.");
            }
        } catch (err) {
            console.error('PDF parse error:', err);
            toast.error("Erro ao ler o PDF. Verifique se o arquivo não está corrompido.");
        } finally {
            setIsParsing(false);
        }
    };

    const toggleTransaction = (id: string) => {
        setTransactionsToReview(prev => prev.map(t =>
            t.id === id ? { ...t, selected: !t.selected } : t
        ));
    };

    const insertTransaction = useSupabaseInsert("transactions");

    const handleFinalImport = async () => {
        setIsImporting(true);
        const selectedTransactions = transactionsToReview.filter(t => t.selected);

        try {
            const year = parseInt(importYear);

            for (const trans of selectedTransactions) {
                let transDate;
                if (trans.date.includes('/')) {
                    const [dd, mm] = trans.date.split('/');
                    transDate = new Date(year, parseInt(mm) - 1, parseInt(dd));
                } else {
                    transDate = new Date();
                }

                await insertTransaction.mutateAsync({
                    description: trans.description,
                    amount: trans.amount,
                    category: trans.category,
                    date: transDate.toISOString().split('T')[0],
                    type: 'expense',
                    responsible: userName,
                    status: 'realizadas'
                });
            }

            toast.success(`${selectedTransactions.length} transações importadas com sucesso!`);
            setIsReviewModalOpen(false);
        } catch (error) {
            console.error("Error importing transactions:", error);
            toast.error("Erro ao importar transações. Tente novamente.");
        } finally {
            setIsImporting(false);
        }
    };

    const expenseCategoriesOptions = [
        { id: "moradia", name: "Moradia", icon: "🏠" },
        { id: "alimentacao", name: "Alimentação", icon: "🍔" },
        { id: "transporte", name: "Transporte", icon: "🚗" },
        { id: "saude", name: "Saúde", icon: "💊" },
        { id: "educacao", name: "Educação", icon: "📚" },
        { id: "lazer", name: "Lazer", icon: "🎮" },
        { id: "vestuario", name: "Vestuário", icon: "👕" },
        { id: "compras", name: "Compras", icon: "🛍️" },
        { id: "servicos", name: "Serviços", icon: "💡" },
        { id: "assinaturas", name: "Assinaturas", icon: "📱" },
        { id: "impostos", name: "Impostos", icon: "📋" },
        { id: "doacoes", name: "Doações e Ofertas", icon: "🤝" },
        { id: "pet", name: "Pet", icon: "🐶" },
        { id: "viagens", name: "Viagens", icon: "✈️" },
        { id: "beleza", name: "Beleza e Cuidados", icon: "💅" },
        { id: "streaming", name: "Streaming/Apps", icon: "📺" },
        { id: "dividas", name: "Dívidas", icon: "📋" },
        { id: "outros-despesas", name: "Outros", icon: "📦" },
    ];

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <span className="text-lg font-semibold min-w-[140px] text-center capitalize">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Dialog open={isNewCardModalOpen} onOpenChange={setIsNewCardModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#2D9B73] hover:bg-[#258563] text-white font-medium gap-2">
                                    <Plus className="w-4 h-4" /> Adicionar Cartão
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle>Novo Cartão de Crédito</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-5 py-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500">Nome do Cartão <span className="text-red-500">*</span></Label>
                                        <Input placeholder="Ex: Nubank, Itaú..." value={cardName} onChange={(e) => setCardName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-500">Vencimento</Label>
                                            <Select value={dueDay} onValueChange={setDueDay}>
                                                <SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger>
                                                <SelectContent className="max-h-[200px]">{days.map(d => <SelectItem key={d} value={d}>Dia {d}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-500">Fechamento</Label>
                                            <Select value={closingDay} onValueChange={setClosingDay}>
                                                <SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger>
                                                <SelectContent className="max-h-[200px]">{days.map(d => <SelectItem key={d} value={d}>Dia {d}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500">Responsável</Label>
                                        <Select value={responsible} onValueChange={setResponsible}>
                                            <SelectTrigger><SelectValue placeholder="Quem é o dono?" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={userName.toLowerCase()}>{userName}</SelectItem>
                                                <SelectItem value="outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button className="w-full bg-[#2D9B73] hover:bg-[#258563] text-white h-11 font-bold rounded-xl" onClick={handleAddCard}>Adicionar Cartão</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {cards.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[32px] p-16 flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <CreditCard className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum cartão cadastrado</h3>
                        <p className="text-slate-400 max-w-[280px]">Personalize seu controle financeiro adicionando seus cartões aqui.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map(card => (
                            <div key={card.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#2D9B73] group-hover:text-white group-hover:border-[#2D9B73] transition-all">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg leading-tight">{card.name}</h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fecha {card.closingDay} • Vence {card.dueDay}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-xl"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 rounded-2xl p-5 mb-6 border border-slate-100/50">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total da Fatura</p>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase">Pendente</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-800">R$ 0,00</div>
                                </div>

                                <div className="flex items-center justify-between mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400"><Clock className="w-3.5 h-3.5" /></div>
                                        <span className="text-xs font-bold text-slate-600">Status do Pagamento</span>
                                    </div>
                                    <Switch className="scale-75 data-[state=checked]:bg-[#2D9B73]" />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Gastos</span>
                                        <div className="flex items-center gap-1.5">
                                            <Button variant="outline" size="sm" className="h-8 px-3 text-[11px] font-bold gap-2 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => handleOpenImportModal(card.id)}>
                                                <Upload className="w-3.5 h-3.5" /> Importar PDF
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 px-3 text-[11px] font-bold gap-2 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors">
                                                <Plus className="w-3.5 h-3.5" /> Lançar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-[11px] font-bold border-2 border-dashed border-slate-50 rounded-2xl bg-slate-50/20">
                                        Nenhum gasto registrado
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shadow-sm tracking-tighter uppercase">{card.responsible.substring(0, 2)}</div>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">{card.responsible}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300">Limite: R$ {card.limit.toLocaleString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                        <div className="p-8 pb-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                                <FileText className="w-7 h-7 text-[#2D9B73]" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-800">Importar Fatura</DialogTitle>
                            <p className="text-sm font-medium text-slate-400 mt-1">Selecione o arquivo da fatura do cartão {cards.find(c => c.id === selectedCardForImport)?.name}</p>
                        </div>

                        <div className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mês de Referência</Label>
                                    <Select value={importMonth} onValueChange={setImportMonth}>
                                        <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:ring-primary"><SelectValue placeholder="Mês" /></SelectTrigger>
                                        <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ano</Label>
                                    <Select value={importYear} onValueChange={setImportYear}>
                                        <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:ring-primary"><SelectValue placeholder="Ano" /></SelectTrigger>
                                        <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Arquivo PDF</Label>
                                <label className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-[24px] cursor-pointer transition-all duration-300 ${importFile ? 'border-emerald-400 bg-emerald-50/50 shadow-inner' : 'border-slate-100 bg-slate-50/30 hover:border-emerald-300 hover:bg-slate-50'}`}>
                                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                                    {importFile ? (
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-200"><FileText className="w-6 h-6 text-white" /></div>
                                            <p className="text-sm font-black text-emerald-800 truncate max-w-[200px]">{importFile.name}</p>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">{(importFile.size / 1024).toFixed(1)} KB • Pronto para analisar</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-1 text-slate-400"><Upload className="w-6 h-6" /></div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-600">Clique para selecionar o PDF</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Apenas faturas digitais (não escaneadas)</p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Confirmar Valor Total (opcional)</Label>
                                <Input placeholder="R$ 0,00" value={importTotal} onChange={(e) => setImportTotal(e.target.value)} className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-slate-800 text-lg placeholder:text-slate-300 focus:ring-primary" />
                            </div>
                        </div>

                        <DialogFooter className="p-8 pt-4 bg-slate-50/30 grid grid-cols-2 gap-4">
                            <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400 hover:bg-white hover:text-slate-600 transition-all" onClick={() => setIsImportModalOpen(false)}>Cancelar</Button>
                            <Button className="h-12 rounded-2xl bg-[#2D9B73] hover:bg-[#258563] text-white font-black shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all active:scale-98 gap-2" onClick={handleContinueImport} disabled={!importFile || isParsing}>
                                {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                {isParsing ? 'Processando Fatura...' : 'Analisar PDF'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[40px]">
                        <DialogHeader className="p-10 pb-6 border-b border-slate-50 bg-white">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Revisão de Dados</span>
                                    </div>
                                    <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Transações Extraídas</DialogTitle>
                                    <p className="text-sm font-bold text-slate-400 mt-1">Categorizamos tudo para você. Revise antes de salvar.</p>
                                </div>
                                <div className="text-right px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mês da Fatura</p>
                                    <p className="text-lg font-black text-slate-700">{importMonth} / {importYear}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-200"><Check className="w-3 h-3" /></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Transações Selecionadas</span>
                                    </div>
                                    <span className="text-2xl font-black text-emerald-700 leading-none">
                                        {transactionsToReview.filter(t => t.selected).length} <span className="text-sm font-bold text-emerald-600/60 uppercase">itens</span>
                                    </span>
                                </div>
                                <div className="flex flex-col p-4 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center shadow-sm"><FileText className="w-3 h-3" /></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Valor Total Selecionado</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-800 leading-none">
                                        R$ {transactionsToReview.filter(t => t.selected).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-3 custom-scrollbar bg-slate-50/20">
                            {transactionsToReview.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className={`flex items-center justify-between p-5 rounded-[28px] border-2 transition-all duration-300 ${transaction.selected ? 'bg-white border-emerald-400/30 shadow-xl shadow-emerald-500/5 translate-x-1' : 'bg-slate-50/50 border-transparent opacity-60 grayscale'}`}
                                >
                                    <div className="flex items-center gap-5 flex-1 cursor-pointer group" onClick={() => toggleTransaction(transaction.id)}>
                                        <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${transaction.selected ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100' : 'border-slate-200 group-hover:border-emerald-300 bg-white'}`}>
                                            {transaction.selected && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{transaction.description}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{transaction.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-red-500 tracking-tighter">R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <Select
                                            value={transaction.category}
                                            onValueChange={(value) => {
                                                setTransactionsToReview(prev => prev.map(t =>
                                                    t.id === transaction.id ? { ...t, category: value } : t
                                                ));
                                            }}
                                        >
                                            <SelectTrigger className="w-[180px] h-11 text-[11px] font-black uppercase tracking-widest rounded-2xl border-slate-100 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                                {expenseCategoriesOptions.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id} className="rounded-xl text-[11px] py-2.5 font-black uppercase tracking-widest cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                                                        <span className="flex items-center gap-2">
                                                            <span>{cat.icon}</span>
                                                            <span>{cat.name}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="p-10 pt-10 bg-white border-t border-slate-50 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                className="px-10 h-14 rounded-[24px] text-sm font-black text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all uppercase tracking-widest"
                                onClick={() => setIsReviewModalOpen(false)}
                            >
                                Rejeitar Tudo
                            </Button>
                            <Button
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 h-16 rounded-[28px] text-lg font-black shadow-2xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 gap-3 border-b-4 border-emerald-700"
                                onClick={handleFinalImport}
                                disabled={isImporting}
                            >
                                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-6 h-6 stroke-[3]" />}
                                {isImporting ? "IMPORTANDO..." : `IMPORTAR ${transactionsToReview.filter(t => t.selected).length} ITENS`}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default Cartoes;
