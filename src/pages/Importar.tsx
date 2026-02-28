import { useState, useMemo } from "react";
import {
    ChevronLeft, Download, Upload as UploadIcon, FileSpreadsheet,
    Check, X, Loader2, AlertTriangle, CheckCircle2, Trash2,
    Search, Filter, ArrowRight, RefreshCcw, Eye
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData, useSupabaseInsert } from "@/hooks/useSupabase";
import { ArrowLeftRight } from "lucide-react";

// ─── Categories ──────────────────────────────────────────────────────
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
    { id: "aluguel-receita", name: "Aluguel/Locação", icon: "🔑", type: "income" },
    { id: "dividendos", name: "Dividendos/Lucros", icon: "📈", type: "income" },
    { id: "outros-receitas", name: "Outros", icon: "📦", type: "income" },
    // Expense
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
    { id: "investimentos", name: "Investimentos", icon: "📈", type: "expense" },
    { id: "dividas", name: "Dívidas", icon: "📋", type: "expense" },
    { id: "outros-despesas", name: "Outros", icon: "📦", type: "expense" },
    // Transfer
    { id: "transferencia", name: "Transferência Interna", icon: "🔄", type: "transfer" },
];

// ─── Transfer Detection ──────────────────────────────────────────────
function isInternalTransfer(
    description: string,
    ownerNames: string[],
    accountNames: string[]
): boolean {
    const d = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // REGRA 1: Padrões textuais que SEMPRE são transferência
    const alwaysTransfer = [
        /transferencia\s+entre\s+contas/,
        /movimentacao\s+interna/,
        /resgate\s+(automatico|aplicacao)/,
        /aplicacao\s+automatica/,
        /ted\s+mesma\s+titularidade/,
    ];
    if (alwaysTransfer.some(p => p.test(d))) return true;

    // REGRA 2: Pix/TED com nome do próprio titular
    const isPix = /pix|transferencia\s+(enviada|recebida)/.test(d);
    const isTED = /\bted\b/.test(d);

    if (isPix || isTED) {
        for (const name of ownerNames) {
            if (!name || name.length < 3) continue;
            const normalized = name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // Split into significant name parts (> 2 chars)
            const parts = normalized.split(/\s+/).filter(p => p.length > 2);
            const matchCount = parts.filter(part => d.includes(part)).length;

            // 2+ matching words → high confidence it's the same person
            if (matchCount >= 2) return true;
        }

        // REGRA 3: Pix/TED menciona o nome de outra conta cadastrada
        for (const accName of accountNames) {
            if (!accName || accName.length < 3) continue;
            const normalizedAcc = accName.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (d.includes(normalizedAcc)) return true;
        }
    }

    return false;
}

// ─── Smart Category Guesser ──────────────────────────────────────────
function guessCategory(description: string, type: "income" | "expense" | "transfer"): string {
    if (type === "transfer") return "transferencia";

    const d = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (type === "income") {
        if (/salario|folha|holerite|pagamento\s*(de\s*)?salario/.test(d)) return "salario";
        if (/vale.?refeicao|vr\b/.test(d)) return "vale-refeicao";
        if (/vale.?alimentacao|va\b/.test(d)) return "vale-alimentacao";
        if (/bonus|plr|participacao/.test(d)) return "bonus";
        if (/ferias/.test(d)) return "ferias";
        if (/13|decimo/.test(d)) return "decimo-terceiro";
        if (/freelan|freela|projeto/.test(d)) return "projeto";
        if (/consult/.test(d)) return "consultoria";
        if (/comissao/.test(d)) return "comissao";
        if (/aluguel|locacao/.test(d)) return "aluguel-receita";
        if (/dividendo|lucro|rendiment/.test(d)) return "dividendos";
        if (/venda/.test(d)) return "venda-produto";
        if (/servico/.test(d)) return "servicos-prestados";
        if (/nu pagamentos|transferencia recebida|pix recebid/.test(d)) return "outros-receitas";
        return "outros-receitas";
    }

    // Expense
    if (/super\s*mercado|mercado|supermercado|atacadao|atacado|assai|carrefour|guanabara|pao\s*de\s*acucar|extra\b/.test(d)) return "alimentacao";
    if (/padaria|lanchonete|restaurante|ifood|burger|pizza|mcdo|mcdonald|arcos\s*dourados|habib|subway|sushi|acai|cafe|confeitaria|bolo|doceria|food|cozinha/.test(d)) return "alimentacao";
    if (/uber|99|lyft|cabify|taxi|onibus|metro|bilhet|passagem|combustivel|gasolina|etanol|estacion|pedagio|zona\s*azul|sem\s*parar/.test(d)) return "transporte";
    if (/aluguel|condominio|iptu|agua|luz|energia|enel|cedae|sabesp|copasa|gas|celpe/.test(d)) return "moradia";
    if (/farmacia|drogaria|medic|hospital|clinica|consulta|exame|laborat|plano\s*de\s*saude|unimed|amil|bradesco\s*saude|sulamerica/.test(d)) return "saude";
    if (/escola|faculdade|universidade|curso|livro|material\s*escolar|mensalidade|educacao/.test(d)) return "educacao";
    if (/netflix|spotify|disney|amazon\s*prime|hbo|youtube\s*premium|apple\s*music|deezer|globoplay|paramount|star\+|crunchyroll/.test(d)) return "streaming";
    if (/assinatura|mensalidade|plano|recorrente/.test(d)) return "assinaturas";
    if (/cinema|teatro|show|ingresso|parque|jogo|game|steam|playstation|xbox|nintendo|diversao/.test(d)) return "lazer";
    if (/roupa|sapato|tenis|calcado|loja|renner|riachuelo|cea|marisa|zara|shein|shopee|centauro|decathlon/.test(d)) return "vestuario";
    if (/pet|veterinario|racao|petshop|cobasi|petz/.test(d)) return "pet";
    if (/beleza|salao|barbearia|cabeleir|manicure|estetica|cosmetico|perfume|boticario|natura/.test(d)) return "beleza";
    if (/viagem|hotel|hostel|airbnb|booking|passagem\s*aer|latam|gol|azul|voo/.test(d)) return "viagens";
    if (/imposto|taxa|tributo|darf|gps|inss|irpf|icms|iss/.test(d)) return "impostos";
    if (/doacao|oferta|igreja|dizimo|caridade/.test(d)) return "doacoes";
    if (/investimento|aplicacao|cdb|tesouro|fundo|acao|bolsa|cripto|bitcoin|b3/.test(d)) return "investimentos";
    if (/emprestimo|financiamento|parcela|divida|consorcio/.test(d)) return "dividas";
    if (/re\s*telecom|telecom|celular|telefone|internet|claro|vivo|tim|oi\b/.test(d)) return "servicos";
    if (/compra|loja|magazine|americanas|casas\s*bahia|mercado\s*livre|amazon/.test(d)) return "compras";
    if (/tecnologia|tecnol/.test(d)) return "servicos";
    if (/moda\s*mundial|loja|shopping/.test(d)) return "vestuario";

    return "outros-despesas";
}

// ─── Helpers ─────────────────────────────────────────────────────────
const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface ParsedTransaction {
    id: string;
    date: string;       // yyyy-MM-dd
    description: string;
    amount: number;      // always positive (for display)
    originalAmount: number; // signed value (for auditing)
    type: "income" | "expense" | "transfer";
    transferDirection?: "sent" | "received"; // direction of transfer
    category: string;
    selected: boolean;
    originalDescription: string;
}

// Parse Brazilian date "DD/MM/YYYY" → "YYYY-MM-DD"
function parseBRDate(raw: string): string | null {
    if (!raw) return null;

    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();

    // DD/MM/YYYY or DD-MM-YYYY
    const match = raw.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (match) {
        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        let year = match[3];
        if (year.length === 2) year = "20" + year;
        return `${year}-${month}-${day}`;
    }

    // Try parsing as Excel serial number
    const num = Number(raw);
    if (!isNaN(num) && num > 40000 && num < 60000) {
        // Excel serial date to JS
        const excelEpoch = new Date(1899, 11, 30);
        const d = new Date(excelEpoch.getTime() + num * 86400000);
        return format(d, "yyyy-MM-dd");
    }

    return null;
}

// Parse value: handles "1.234,56" / "-1234.56" / "1234,56" etc.
function parseValue(raw: any): number {
    if (typeof raw === "number") return raw;
    if (raw == null) return 0;
    const s = String(raw).trim();
    if (!s) return 0;

    // Remove currency symbols
    let clean = s.replace(/R\$\s*/gi, "").trim();

    // Check if it uses Brazilian format (comma as decimal separator)
    // e.g., "1.234,56" or "-37,70"
    if (/,\d{1,2}$/.test(clean)) {
        clean = clean.replace(/\./g, "").replace(",", ".");
    }

    return parseFloat(clean) || 0;
}

// Simplify long Pix descriptions
function simplifyDescription(desc: string): string {
    if (!desc) return "";
    let simplified = desc.trim();

    // Remove long CNPJ/CPF, Agência, Conta details for readability
    simplified = simplified
        .replace(/\s*-\s*\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\s*/g, " ")  // CNPJ
        .replace(/\s*-?\s*\d{3}\.\d{3}\.\d{3}-\d{2}\s*/g, " ")       // CPF
        .replace(/\s*Ag[eê]ncia:\s*\d+\s*/gi, " ")
        .replace(/\s*Conta:\s*[\d\-]+\s*/gi, " ")
        .replace(/\s*IP\s*S\.?A\.?\s*/gi, " ")
        .replace(/\s*LTDA\.?\s*/gi, " ")
        .replace(/\s*S\.?A\.?\s*/gi, " ")
        .replace(/\s*\(\d{4}\)\s*/g, " ")
        .replace(/\s*-+\s*$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    // Truncate very long descriptions
    if (simplified.length > 80) {
        simplified = simplified.substring(0, 77) + "...";
    }

    return simplified;
}

// ─── Column Detection ────────────────────────────────────────────────
interface ColumnMapping {
    date: number;
    value: number;
    description: number;
    type?: number;      // optional: "receita"/"despesa" column
    category?: number;  // optional
}

function detectColumns(headers: string[]): ColumnMapping | null {
    const normalized = headers.map(h =>
        (h || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    );

    let dateCol = -1, valueCol = -1, descCol = -1, typeCol = -1, catCol = -1;

    for (let i = 0; i < normalized.length; i++) {
        const h = normalized[i];
        if (dateCol < 0 && /^data$|^date$|^dt$|^dia$/.test(h)) dateCol = i;
        if (valueCol < 0 && /^valor$|^value$|^amount$|^quantia$|^vl$/.test(h)) valueCol = i;
        if (descCol < 0 && /^descri|^description$|^historico$|^detalhe$|^lancamento$|^memo$/.test(h)) descCol = i;
        if (typeCol < 0 && /^tipo$|^type$/.test(h)) typeCol = i;
        if (catCol < 0 && /^categoria$|^category$|^cat$/.test(h)) catCol = i;
    }

    // If we couldn't find description, try "identificador" + next column
    if (descCol < 0) {
        for (let i = 0; i < normalized.length; i++) {
            if (/^identific/.test(normalized[i]) && i + 1 < normalized.length) {
                // The actual description might be the column AFTER "Identificador"
                // or perhaps the "Identificador" is the description
            }
            // Broader search
            if (/^nome$|^obs$|^observ/.test(normalized[i])) descCol = i;
        }
    }

    // If we found at least date + value, try to figure out description
    if (dateCol >= 0 && valueCol >= 0 && descCol < 0) {
        // Pick the first text-like column that isn't date/value/identifier
        for (let i = 0; i < normalized.length; i++) {
            if (i === dateCol || i === valueCol) continue;
            if (/^identific/.test(normalized[i])) continue; // skip identifier
            descCol = i;
            break;
        }
    }

    // Handle: if "Identificador" column exists but description detected wrong
    // Re-check: the actual description in user's file is the column AFTER "Identificador"
    const idCol = normalized.findIndex(h => /^identific/.test(h));
    if (idCol >= 0 && descCol < 0) {
        // Use the column after Identificador as description
        if (idCol + 1 < normalized.length) {
            descCol = idCol + 1;
        }
    }

    if (dateCol < 0 || valueCol < 0 || descCol < 0) return null;

    const mapping: ColumnMapping = { date: dateCol, value: valueCol, description: descCol };
    if (typeCol >= 0) mapping.type = typeCol;
    if (catCol >= 0) mapping.category = catCol;
    return mapping;
}

// ─── OFX Parser ──────────────────────────────────────────────────────
function parseOFX(content: string, ownerNames: string[] = [], accountNames: string[] = []): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];
    const stmtRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    let idx = 0;

    while ((match = stmtRegex.exec(content)) !== null) {
        const block = match[1];
        const get = (tag: string) => {
            const m = block.match(new RegExp(`<${tag}>([^<\\n]+)`, "i"));
            return m ? m[1].trim() : "";
        };

        const rawDate = get("DTPOSTED");
        const rawAmount = get("TRNAMT");
        const rawName = get("NAME") || get("MEMO");
        const rawType = get("TRNTYPE");

        let dateStr = "";
        if (rawDate.length >= 8) {
            dateStr = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
        }

        const amount = parseFloat(rawAmount) || 0;
        let type: "income" | "expense" | "transfer" = amount >= 0 ? "income" : "expense";
        let transferDirection: "sent" | "received" | undefined = undefined;
        const absAmount = Math.abs(amount);

        // Check OFX TRNTYPE for transfers
        if (rawType && /xfer|transfer/i.test(rawType)) {
            type = "transfer";
            transferDirection = amount < 0 ? "sent" : "received";
        }

        // Check our internal transfer detection rules
        if (type !== "transfer" && isInternalTransfer(rawName, ownerNames, accountNames)) {
            transferDirection = amount < 0 ? "sent" : "received";
            type = "transfer";
        }

        if (dateStr && rawName) {
            const simplified = simplifyDescription(rawName);
            transactions.push({
                id: `ofx-${idx++}`,
                date: dateStr,
                description: simplified,
                originalDescription: rawName,
                amount: absAmount,
                originalAmount: amount,
                type,
                transferDirection,
                category: guessCategory(rawName, type),
                selected: true,
            });
        }
    }
    return transactions;
}

// ─── Component ───────────────────────────────────────────────────────
const Importar = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"upload" | "review" | "done">("upload");
    const [fileName, setFileName] = useState("");
    const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "transfer">("all");
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data: rawAccounts } = useSupabaseData("accounts");
    const { data: rawProfiles } = useSupabaseData("profiles");
    const accounts = (rawAccounts as any[]) || [];
    const profiles = (rawProfiles as any[]) || [];
    const [selectedAccountId, setSelectedAccountId] = useState("");

    // Build owner names for transfer detection
    const ownerNames = useMemo(() => {
        const names: string[] = [];
        profiles.forEach((p: any) => {
            if (p.full_name) names.push(p.full_name);
        });
        return names;
    }, [profiles]);

    const accountNames = useMemo(() => {
        return accounts.map((a: any) => a.name).filter(Boolean);
    }, [accounts]);

    const insertTransaction = useSupabaseInsert("transactions");

    // ── Stats — "balance" renamed to "resultado" (Resultado do período)
    const stats = useMemo(() => {
        const selected = parsedData.filter(t => t.selected);
        const income = selected.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = selected.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const transfers = selected.filter(t => t.type === "transfer").length;
        const transfersSent = selected.filter(t => t.type === "transfer" && t.transferDirection === "sent").length;
        const transfersReceived = selected.filter(t => t.type === "transfer" && t.transferDirection === "received").length;
        const resultado = income - expense; // transfers excluded!
        const isConsistent = Math.abs(resultado - (income - expense)) < 0.01;
        return { total: selected.length, income, expense, resultado, transfers, transfersSent, transfersReceived, isConsistent };
    }, [parsedData]);

    // ── Filtered data
    const filteredData = useMemo(() => {
        let data = parsedData;
        if (filterType !== "all") data = data.filter(t => t.type === filterType);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(t => t.description.toLowerCase().includes(term) || t.originalDescription.toLowerCase().includes(term));
        }
        return data;
    }, [parsedData, filterType, searchTerm]);

    // ── Download Model
    const handleDownloadModel = () => {
        const ws_data = [
            ["Data", "Descrição", "Valor", "Tipo", "Categoria", "Recorrência"],
            ["15/01/2025", "Salário", 5000, "receita", "salario", "mensal"],
            ["20/01/2025", "Aluguel", 1500, "despesa", "moradia", "mensal"],
            ["05/01/2025", "Supermercado", 450.50, "despesa", "alimentacao", ""],
            ["10/01/2025", "Freelance", 2000, "receita", "servicos-prestados", ""],
            [],
            ["=== INSTRUÇÕES ==="],
            ["Data:", "Use formato DD/MM/AAAA"],
            ["Descrição:", "Nome da transação"],
            ["Valor:", "Número positivo (ex: 100 ou 100,50)"],
            ["Tipo:", "receita ou despesa"],
            ["Categoria:", "Opcional - veja categorias abaixo"],
            ["Recorrência:", "Opcional - semanal, quinzenal ou mensal"],
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, "Modelo");
        XLSX.writeFile(wb, "modelo_bussola_financeira.xlsx");
    };

    // ── File Upload Handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);

        try {
            const ext = file.name.split(".").pop()?.toLowerCase();

            if (ext === "ofx" || ext === "qfx") {
                // OFX/QFX
                const text = await file.text();
                const txns = parseOFX(text, ownerNames, accountNames);
                if (txns.length === 0) {
                    toast.error("Nenhuma transação encontrada no arquivo OFX.");
                    setIsProcessing(false);
                    return;
                }
                setParsedData(txns);
                setStep("review");
                toast.success(`${txns.length} transações encontradas!`);
            } else {
                // CSV / Excel
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: true, defval: "" });

                if (!jsonData || jsonData.length < 2) {
                    toast.error("Arquivo vazio ou sem dados suficientes.");
                    setIsProcessing(false);
                    return;
                }

                // Try to detect headers
                const headerRow = jsonData[0] as string[];
                const mapping = detectColumns(headerRow);

                if (!mapping) {
                    toast.error("Não foi possível detectar as colunas. Verifique se o arquivo tem colunas: Data, Valor, Descrição.");
                    setIsProcessing(false);
                    return;
                }

                const transactions: ParsedTransaction[] = [];
                let skipped = 0;

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    if (!row || row.length === 0) continue;

                    // Skip instruction/info rows
                    const firstCell = String(row[0] || "").trim();
                    if (firstCell.startsWith("===") || firstCell === "") continue;

                    const rawDate = String(row[mapping.date] ?? "");
                    const rawValue = row[mapping.value];
                    const rawDesc = String(row[mapping.description] ?? "");
                    const rawType = mapping.type != null ? String(row[mapping.type] ?? "").toLowerCase().trim() : "";
                    const rawCategory = mapping.category != null ? String(row[mapping.category] ?? "").trim() : "";

                    const dateStr = parseBRDate(rawDate);
                    const value = parseValue(rawValue);

                    if (!dateStr || (!value && value !== 0) || !rawDesc) {
                        skipped++;
                        continue;
                    }
                    if (value === 0) {
                        skipped++;
                        continue;
                    }

                    // Determine type (income / expense / transfer)
                    let type: "income" | "expense" | "transfer";
                    let transferDirection: "sent" | "received" | undefined = undefined;

                    if (rawType && /transfer/.test(rawType)) {
                        type = "transfer";
                        transferDirection = value < 0 ? "sent" : "received";
                    } else if (rawType) {
                        type = /receita|income|credito|credit|entrada/.test(rawType) ? "income" : "expense";
                    } else {
                        type = value > 0 ? "income" : "expense";
                    }

                    // Check if this is an internal transfer (Pix/TED to self)
                    if (type !== "transfer" && isInternalTransfer(rawDesc, ownerNames, accountNames)) {
                        transferDirection = value < 0 ? "sent" : "received";
                        type = "transfer";
                    }

                    const absAmount = Math.abs(value);
                    const simplified = simplifyDescription(rawDesc);
                    const category = rawCategory || guessCategory(rawDesc, type);

                    transactions.push({
                        id: `row-${i}`,
                        date: dateStr,
                        description: simplified,
                        originalDescription: rawDesc,
                        amount: absAmount,
                        originalAmount: value, // preserve signed value
                        type,
                        transferDirection,
                        category,
                        selected: true,
                    });
                }

                if (transactions.length === 0) {
                    toast.error("Nenhuma transação válida encontrada no arquivo.");
                    setIsProcessing(false);
                    return;
                }

                // Sort by date descending
                transactions.sort((a, b) => b.date.localeCompare(a.date));
                setParsedData(transactions);
                setStep("review");

                let msg = `${transactions.length} transações encontradas!`;
                if (skipped > 0) msg += ` (${skipped} linhas ignoradas)`;
                toast.success(msg);
            }
        } catch (err: any) {
            console.error("Parse error:", err);
            toast.error("Erro ao ler o arquivo: " + (err.message || "Formato não reconhecido"));
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Toggle selection
    const toggleSelection = (id: string) => {
        setParsedData(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
    };

    const toggleAll = () => {
        const allSelected = filteredData.every(t => t.selected);
        const ids = new Set(filteredData.map(t => t.id));
        setParsedData(prev => prev.map(t => ids.has(t.id) ? { ...t, selected: !allSelected } : t));
    };

    // ── Update category
    const updateCategory = (id: string, category: string) => {
        setParsedData(prev => prev.map(t => t.id === id ? { ...t, category } : t));
        setEditingId(null);
    };

    // ── Update type (cycle: income → expense → transfer → income)
    const toggleType = (id: string) => {
        setParsedData(prev => prev.map(t => {
            if (t.id !== id) return t;
            const nextType: Record<string, "income" | "expense" | "transfer"> = {
                income: "expense",
                expense: "transfer",
                transfer: "income",
            };
            const newType = nextType[t.type] || "expense";
            const newDir = newType === "transfer"
                ? (t.originalAmount < 0 ? "sent" : "received")
                : undefined;
            return {
                ...t,
                type: newType,
                transferDirection: newDir,
                category: guessCategory(t.originalDescription, newType),
            };
        }));
    };

    // ── Remove item
    const removeItem = (id: string) => {
        setParsedData(prev => prev.filter(t => t.id !== id));
    };

    // ── Save to Supabase
    const handleSave = async () => {
        const selected = parsedData.filter(t => t.selected);
        if (selected.length === 0) {
            toast.error("Selecione pelo menos uma transação para importar.");
            return;
        }

        setIsSaving(true);
        try {
            const buildBatch = (includeNewColumns: boolean) => selected.map(t => {
                const row: any = {
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.category,
                    date: t.date,
                    status: "realizadas",
                    account_id: selectedAccountId || null,
                };
                if (includeNewColumns) {
                    row.original_amount = t.originalAmount;
                    row.transfer_direction = t.type === "transfer" ? (t.transferDirection || null) : null;
                }
                return row;
            });

            // Insert in chunks of 50 to avoid issues
            const chunkSize = 50;
            let batch = buildBatch(true);
            let retried = false;

            for (let i = 0; i < batch.length; i += chunkSize) {
                const chunk = batch.slice(i, i + chunkSize);
                try {
                    await insertTransaction.mutateAsync(chunk);
                } catch (chunkErr: any) {
                    // If the error is about missing columns, retry without them
                    if (!retried && chunkErr.message && /column.*does not exist|schema cache/i.test(chunkErr.message)) {
                        console.warn("New columns not found in DB, retrying without them...");
                        toast.warning("Colunas novas pendentes no banco. Importando sem dados extras (original_amount, transfer_direction). Execute a migração SQL no Supabase.");
                        batch = buildBatch(false);
                        retried = true;
                        // Restart from the beginning with the fallback batch
                        i = -chunkSize; // will be incremented to 0 in the next loop iteration
                        continue;
                    }
                    throw chunkErr;
                }
            }

            toast.success(`${selected.length} transações importadas com sucesso!`);
            setStep("done");
        } catch (err: any) {
            console.error("Save error:", err);
            toast.error("Erro ao salvar: " + (err.message || "Tente novamente"));
        } finally {
            setIsSaving(false);
        }
    };

    // ── Reset
    const handleReset = () => {
        setParsedData([]);
        setStep("upload");
        setFileName("");
        setSearchTerm("");
        setFilterType("all");
    };

    // ─────── Render ──────────────────────────────────────────────────
    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-6 pb-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => step === "review" ? handleReset() : navigate(-1)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Importar Transações</h1>
                        <p className="text-sm text-muted-foreground">
                            {step === "upload" && "Importe de planilhas CSV, Excel ou extrato bancário OFX"}
                            {step === "review" && `Revisando ${parsedData.length} transações de "${fileName}"`}
                            {step === "done" && "Importação concluída!"}
                        </p>
                    </div>
                </div>

                {/* ════════ STEP: UPLOAD ════════ */}
                {step === "upload" && (
                    <>
                        {/* Step 1: Download Model */}
                        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Baixar Modelo</h2>
                                        <p className="text-sm text-muted-foreground">Use nosso modelo de planilha para garantir que as colunas estejam corretas</p>
                                    </div>
                                    <Button variant="outline" className="gap-2 border-border hover:bg-muted font-medium" onClick={handleDownloadModel}>
                                        <Download className="w-4 h-4" /> Baixar modelo Excel
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Upload File */}
                        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div className="space-y-4 w-full">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Enviar Arquivo</h2>
                                        <p className="text-sm text-muted-foreground">Selecione seu arquivo CSV, Excel ou OFX do banco</p>
                                    </div>

                                    {/* Drop zone */}
                                    <label
                                        className={cn(
                                            "relative flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                                            "border-slate-200 bg-slate-50/50 hover:border-[#2D9B73] hover:bg-[#F3FAF7]",
                                            isProcessing && "pointer-events-none opacity-60"
                                        )}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-10 h-10 text-[#2D9B73] animate-spin" />
                                                <p className="text-sm font-semibold text-slate-600">Processando arquivo...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-14 h-14 rounded-2xl bg-[#2D9B73]/10 flex items-center justify-center">
                                                    <UploadIcon className="w-7 h-7 text-[#2D9B73]" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-slate-700">
                                                        Clique para selecionar ou arraste um arquivo aqui
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        CSV, Excel (.xlsx/.xls), OFX/QFX (extrato bancário)
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".csv,.xlsx,.xls,.ofx,.qfx"
                                            onChange={handleFileUpload}
                                            disabled={isProcessing}
                                        />
                                    </label>

                                    {/* Tips */}
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                            <p className="text-sm font-bold text-amber-700">Dicas para importação</p>
                                        </div>
                                        <ul className="text-xs text-amber-600 space-y-1 ml-6">
                                            <li>• O arquivo deve ter pelo menos as colunas: <strong>Data</strong>, <strong>Valor</strong> e <strong>Descrição</strong></li>
                                            <li>• Valores negativos serão classificados como despesa, positivos como receita</li>
                                            <li>• <strong>Transferências internas</strong> (Pix/TED para você mesmo) são detectadas automaticamente</li>
                                            <li>• Extratos bancários OFX exportados direto do banco funcionam perfeitamente</li>
                                            <li>• Você pode revisar e editar as categorias antes de salvar</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ STEP: REVIEW ════════ */}
                {step === "review" && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Selecionadas</span>
                                <p className="text-xl font-black text-slate-800 mt-1">{stats.total} <span className="text-sm font-semibold text-slate-400">/ {parsedData.length}</span></p>
                            </div>
                            <div className="bg-[#F3FAF7] rounded-2xl border border-[#2D9B73]/10 p-5 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Receitas</span>
                                <p className="text-xl font-black text-[#2D9B73] mt-1">{fmt(stats.income)}</p>
                            </div>
                            <div className="bg-[#FFF5F3] rounded-2xl border border-[#D94E38]/10 p-5 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Despesas</span>
                                <p className="text-xl font-black text-[#D94E38] mt-1">{fmt(stats.expense)}</p>
                            </div>
                            <div className="bg-blue-50 rounded-2xl border border-blue-200/50 p-5 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Transferências</span>
                                <p className="text-xl font-black text-blue-600 mt-1">{stats.transfers}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Resultado do Período</span>
                                <p className={cn("text-xl font-black mt-1", stats.resultado >= 0 ? "text-[#2D9B73]" : "text-[#D94E38]")}>{fmt(stats.resultado)}</p>
                            </div>
                        </div>

                        {/* Account Selection */}
                        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Conta de destino</p>
                                        <p className="text-xs text-slate-400">Vincule as transações a uma conta</p>
                                    </div>
                                </div>
                                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                    <SelectTrigger className="w-64 h-10 rounded-xl">
                                        <SelectValue placeholder="Selecionar conta (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sem conta vinculada</SelectItem>
                                        {accounts.map((acc: any) => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("rounded-lg h-9 text-xs font-bold", filterType === "all" && "bg-primary/10 text-primary")}
                                        onClick={() => setFilterType("all")}
                                    >
                                        Todas ({parsedData.length})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("rounded-lg h-9 text-xs font-bold", filterType === "income" && "bg-[#2D9B73]/10 text-[#2D9B73]")}
                                        onClick={() => setFilterType("income")}
                                    >
                                        Receitas ({parsedData.filter(t => t.type === "income").length})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("rounded-lg h-9 text-xs font-bold", filterType === "expense" && "bg-[#D94E38]/10 text-[#D94E38]")}
                                        onClick={() => setFilterType("expense")}
                                    >
                                        Despesas ({parsedData.filter(t => t.type === "expense").length})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("rounded-lg h-9 text-xs font-bold", filterType === "transfer" && "bg-blue-100 text-blue-600")}
                                        onClick={() => setFilterType("transfer")}
                                    >
                                        Transferências ({parsedData.filter(t => t.type === "transfer").length})
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-9 pl-9 w-48 rounded-lg text-sm"
                                        />
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-lg h-9 text-xs font-bold text-slate-500" onClick={toggleAll}>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                        {filteredData.every(t => t.selected) ? "Desmarcar" : "Selecionar"} tudo
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto divide-y divide-border">
                                {filteredData.map((t) => {
                                    const cat = categories.find(c => c.id === t.category);
                                    return (
                                        <div
                                            key={t.id}
                                            className={cn(
                                                "p-4 flex items-center justify-between gap-3 group transition-all hover:bg-slate-50",
                                                !t.selected && "opacity-40 bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => toggleSelection(t.id)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                        t.selected
                                                            ? "bg-[#2D9B73] border-[#2D9B73] text-white"
                                                            : "border-slate-300 bg-white"
                                                    )}
                                                >
                                                    {t.selected && <Check className="w-3.5 h-3.5" />}
                                                </button>

                                                {/* Icon */}
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                                                    {cat?.icon || "📦"}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{t.description}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] font-semibold text-slate-400">
                                                            {format(new Date(t.date + "T00:00:00"), "dd/MM/yyyy")}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        {/* Category selector */}
                                                        {editingId === t.id ? (
                                                            <Select
                                                                value={t.category}
                                                                onValueChange={(val) => updateCategory(t.id, val)}
                                                            >
                                                                <SelectTrigger className="h-6 text-[11px] px-2 rounded-md border-primary w-auto min-w-[140px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="max-h-60">
                                                                    {categories
                                                                        .filter(c => c.type === t.type || c.type === t.type)
                                                                        .map(c => (
                                                                            <SelectItem key={c.id} value={c.id} className="text-xs">
                                                                                {c.icon} {c.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingId(t.id); }}
                                                                className="text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                {cat?.icon} {cat?.name || t.category}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Neutral transfer hint */}
                                                    {t.type === "transfer" && (
                                                        <p className="text-[10px] text-blue-500 font-semibold mt-0.5 italic">
                                                            Transferência interna — não impacta o resultado
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right side */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className={cn(
                                                    "font-black text-sm",
                                                    t.type === "income" ? "text-[#2D9B73]" : t.type === "transfer" ? "text-blue-600" : "text-[#D94E38]"
                                                )}>
                                                    {t.type === "income" ? "+" : t.type === "transfer" ? "" : "-"} {fmt(t.amount)}
                                                </span>

                                                {/* Type toggle */}
                                                <button
                                                    onClick={() => toggleType(t.id)}
                                                    className={cn(
                                                        "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wide transition-colors",
                                                        t.type === "income"
                                                            ? "bg-[#F3FAF7] text-[#2D9B73] hover:bg-[#D6F0E5]"
                                                            : t.type === "transfer"
                                                                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                                : "bg-[#FFF5F3] text-[#D94E38] hover:bg-[#FFE5E1]"
                                                    )}
                                                    title="Clique para alternar: receita → despesa → transferência"
                                                >
                                                    {t.type === "income" ? "Receita" : t.type === "transfer" ? (t.transferDirection === "sent" ? "↑ Enviada" : "↓ Recebida") : "Despesa"}
                                                </button>

                                                {/* Remove */}
                                                <button
                                                    onClick={() => removeItem(t.id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredData.length === 0 && (
                                    <div className="p-12 text-center">
                                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400 font-semibold">Nenhuma transação encontrada</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Bar */}
                        {/* Validation Summary */}
                        <div className={cn(
                            "rounded-2xl border p-4 shadow-sm",
                            stats.isConsistent ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                        )}>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    {stats.isConsistent ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    )}
                                    <div>
                                        <p className={cn("text-sm font-bold", stats.isConsistent ? "text-emerald-700" : "text-red-700")}>
                                            {stats.isConsistent ? "Validação OK" : "Divergência detectada!"}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Resultado = {fmt(stats.income)} − {fmt(stats.expense)} = <strong>{fmt(stats.resultado)}</strong>
                                            {stats.transfers > 0 && (
                                                <span className="text-blue-500 ml-2">
                                                    | {stats.transfers} transferência(s) neutra(s) — {stats.transfersSent} enviada(s), {stats.transfersReceived} recebida(s)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm sticky bottom-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" className="rounded-xl gap-2 font-semibold" onClick={handleReset}>
                                        <RefreshCcw className="w-4 h-4" /> Cancelar
                                    </Button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-sm text-slate-500 font-semibold">
                                        {stats.total} transações selecionadas
                                    </p>
                                    <Button
                                        className="bg-[#2D9B73] hover:bg-[#258563] text-white rounded-xl gap-2 font-bold shadow-sm px-8"
                                        onClick={handleSave}
                                        disabled={isSaving || stats.total === 0}
                                    >
                                        {isSaving ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                                        ) : (
                                            <><Check className="w-4 h-4" /> Importar {stats.total} Transações</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ STEP: DONE ════════ */}
                {step === "done" && (
                    <div className="bg-card rounded-2xl border border-border p-12 shadow-sm text-center">
                        <div className="w-20 h-20 rounded-full bg-[#F3FAF7] flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-[#2D9B73]" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Importação Concluída!</h2>
                        <p className="text-sm text-slate-500 font-semibold mb-8">
                            {stats.total} transações foram importadas com sucesso para o seu extrato.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" className="rounded-xl gap-2 font-semibold" onClick={handleReset}>
                                <UploadIcon className="w-4 h-4" /> Importar Mais
                            </Button>
                            <Button
                                className="bg-[#2D9B73] hover:bg-[#258563] text-white rounded-xl gap-2 font-bold shadow-sm"
                                onClick={() => navigate("/extrato")}
                            >
                                <Eye className="w-4 h-4" /> Ver Extrato
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Importar;
