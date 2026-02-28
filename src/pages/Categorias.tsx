import { useState, useEffect } from "react";
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
    DialogClose
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Plus,
    Tags,
    TrendingDown,
    TrendingUp,
    Coins,
    Briefcase,
    Home,
    Utensils,
    Car,
    ShoppingBag,
    Gamepad2,
    HeartPulse,
    Plane,
    GraduationCap,
    Trash2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseData, useSupabaseInsert, useSupabaseDelete } from "@/hooks/useSupabase";
import { toast } from "sonner";

interface Category {
    id: string;
    nome: string;
    icone: string;
    tipo: "despesas" | "receitas";
    is_custom: boolean;
}

const Categorias = () => {
    const [activeTab, setActiveTab] = useState<"despesas" | "receitas">("despesas");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    // Supabase Hooks
    const { data: categoriesData, isLoading: isLoadingCategories } = useSupabaseData("categories");
    const insertCategory = useSupabaseInsert("categories");
    const deleteCategory = useSupabaseDelete("categories");

    // Standard categories list (as fallback or reference)
    const expenseCategories = [
        { name: "Moradia", icon: "🏠" },
        { name: "Alimentação", icon: "🍔" },
        { name: "Transporte", icon: "🚗" },
        { name: "Saúde", icon: "💊" },
        { name: "Educação", icon: "📚" },
        { name: "Lazer", icon: "🎮" },
        { name: "Vestuário", icon: "👕" },
        { name: "Compras", icon: "🛍️" },
        { name: "Serviços", icon: "💡" },
        { name: "Assinaturas", icon: "📱" },
        { name: "Impostos", icon: "📋" },
        { name: "Doações e Ofertas", icon: "🤝" },
        { name: "Pet", icon: "🐶" },
        { name: "Viagens", icon: "✈️" },
        { name: "Beleza e Cuidados", icon: "💅" },
        { name: "Streaming/Apps", icon: "📺" },
        { name: "Dívidas", icon: "📋" },
        { name: "Investimentos", icon: "📈" },
        { name: "Outros", icon: "📦" },
    ];

    const incomeCategories = [
        { name: "Salário Líquido", icon: "💰" },
        { name: "Vale Refeição", icon: "🍱" },
        { name: "Vale Alimentação", icon: "🛒" },
        { name: "Bônus/PLR", icon: "🎁" },
        { name: "Férias", icon: "🏖️" },
        { name: "13º Salário", icon: "🎄" },
        { name: "Outros", icon: "📦" },
        { name: "Serviços Prestados", icon: "💼" },
        { name: "Projeto/Freela", icon: "📊" },
        { name: "Consultoria", icon: "🎯" },
        { name: "Venda de Produto", icon: "🛍️" },
        { name: "Comissão", icon: "💸" },
        { name: "Aluguel/Locação", icon: "🏠" },
        { name: "Dividendos/Lucros", icon: "📈" },
    ];

    const emojiCategories = [
        {
            id: "finance",
            name: "Dinheiro",
            icon: <Coins className="w-4 h-4" />,
            emojis: ["💰", "💸", "💳", "💴", "💵", "💶", "💷", "🏦", "🧾", "💹"]
        },
        {
            id: "work",
            name: "Trabalho",
            icon: <Briefcase className="w-4 h-4" />,
            emojis: ["💼", "📂", "📊", "📈", "📉", "💻", "🖨️", "📅", "📝", "✒️"]
        },
        {
            id: "house",
            name: "Casa",
            icon: <Home className="w-4 h-4" />,
            emojis: ["🏠", "🏡", "🛋️", "🛏️", "🚪", "🔑", "🪴", "🧹", "🧺", "🔧"]
        },
        {
            id: "food",
            name: "Alimentação",
            icon: <Utensils className="w-4 h-4" />,
            emojis: ["🍔", "🍕", "🥗", "🍣", "🍱", "🍜", "🍝", "🍞", "🥩", "🍗", "🍰", "☕", "🍺", "🍷"]
        },
        {
            id: "transport",
            name: "Transporte",
            icon: <Car className="w-4 h-4" />,
            emojis: ["🚗", "🚕", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🚲", "🛴"]
        },
        {
            id: "shopping",
            name: "Compras",
            icon: <ShoppingBag className="w-4 h-4" />,
            emojis: ["🛍️", "🛒", "🎁", "🕶️", "👕", "👖", "👗", "👘", "🩱", "🎒", "👟", "👠", "🥾", "💍"]
        },
        {
            id: "leisure",
            name: "Lazer",
            icon: <Gamepad2 className="w-4 h-4" />,
            emojis: ["🎮", "🕹️", "🎲", "🎯", "🎳", "🎧", "🎤", "🎨", "🎬", "🎭", "🎪", "🎫", "🎡", "🎢"]
        },
        {
            id: "health",
            name: "Saúde",
            icon: <HeartPulse className="w-4 h-4" />,
            emojis: ["💊", "💉", "🩸", "🩺", "🩹", "🧬", "🦷", "🦴", "🧘", "💪", "🧠", "🚑", "🏥"]
        },
        {
            id: "travel",
            name: "Viagem",
            icon: <Plane className="w-4 h-4" />,
            emojis: ["✈️", "🛫", "🛬", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏖️", "🏝️", "🏜️", "🌋", "🏔️"]
        },
        {
            id: "education",
            name: "Educação",
            icon: <GraduationCap className="w-4 h-4" />,
            emojis: ["🎓", "📚", "📖", "✏️", "🏫", "📏", "📐", "🖍️", "🎒", "🔬", "🔭", "🧪"]
        }
    ];

    const handleCreateCategory = async () => {
        if (!newCategoryName || !selectedEmoji) {
            toast.error("Por favor, preencha o nome e escolha um emoji.");
            return;
        }

        try {
            await insertCategory.mutateAsync({
                nome: newCategoryName,
                icone: selectedEmoji,
                tipo: activeTab,
                is_custom: true
            });

            toast.success("Categoria criada com sucesso!");
            setIsModalOpen(false);
            setNewCategoryName("");
            setSelectedEmoji("");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar categoria.");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await deleteCategory.mutateAsync(id);
            toast.success("Categoria excluída com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir categoria.");
        }
    };

    const categories = (categoriesData as Category[]) || [];
    const customCategories = categories.filter(c => c.tipo === activeTab && c.is_custom);
    const standardCategories = activeTab === "despesas" ? expenseCategories : incomeCategories;

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Tags className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground">Categorias</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gerencie suas categorias personalizadas
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-muted p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab("despesas")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                            activeTab === "despesas"
                                ? "bg-white shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <TrendingDown className="w-4 h-4" /> Despesas
                    </button>
                    <button
                        onClick={() => setActiveTab("receitas")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                            activeTab === "receitas"
                                ? "bg-white shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <TrendingUp className="w-4 h-4" /> Receitas
                    </button>
                </div>

                {/* Custom Categories Section */}
                <div className="bg-card rounded-xl border border-border p-6 min-h-[200px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Categorias Personalizadas</h2>
                            <p className="text-sm text-muted-foreground">Suas categorias de {activeTab === "despesas" ? "despesa" : "receita"} criadas</p>
                        </div>

                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                                    <Plus className="w-4 h-4" />
                                    Nova
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Nova Categoria de {activeTab === "despesas" ? "Despesa" : "Receita"}</DialogTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Crie uma categoria personalizada para organizar suas finanças
                                    </p>
                                </DialogHeader>

                                <div className="grid gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label>Emoji</Label>
                                        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start h-12 text-left font-normal",
                                                        !selectedEmoji && "text-muted-foreground"
                                                    )}
                                                >
                                                    {selectedEmoji ? (
                                                        <span className="text-2xl">{selectedEmoji}</span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-lg">📦</span> Clique para escolher
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[340px] p-0" align="start">
                                                <Tabs defaultValue="finance" className="w-full">
                                                    <TabsList className="w-full justify-start h-12 p-0 bg-secondary/20 border-b border-border overflow-x-auto no-scrollbar rounded-none">
                                                        {emojiCategories.map((cat) => (
                                                            <TabsTrigger
                                                                key={cat.id}
                                                                value={cat.id}
                                                                className="h-full px-3 data-[state=active]:bg-muted/50 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                                            >
                                                                {cat.icon}
                                                            </TabsTrigger>
                                                        ))}
                                                    </TabsList>
                                                    {emojiCategories.map((cat) => (
                                                        <TabsContent key={cat.id} value={cat.id} className="p-4 mt-0">
                                                            <div className="mb-2 text-xs font-medium text-muted-foreground uppercase">{cat.name}</div>
                                                            <div className="grid grid-cols-6 gap-2">
                                                                {cat.emojis.map((emoji) => (
                                                                    <button
                                                                        key={emoji}
                                                                        onClick={() => {
                                                                            setSelectedEmoji(emoji);
                                                                            setIsEmojiPickerOpen(false);
                                                                        }}
                                                                        className="h-10 w-10 flex items-center justify-center text-xl hover:bg-muted rounded-md transition-colors"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    ))}
                                                </Tabs>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome da Categoria</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ex: Apostas, Academia, Investimentos..."
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={handleCreateCategory}
                                        disabled={insertCategory.isPending}
                                    >
                                        {insertCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Criar Categoria
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {isLoadingCategories ? (
                        <div className="flex flex-col items-center justify-center h-24 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Carregando categorias...</p>
                        </div>
                    ) : customCategories.length === 0 ? (
                        <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                            Nenhuma categoria personalizada encontrada.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customCategories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">{cat.icone}</span>
                                        <span className="font-medium text-foreground">{cat.nome}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        disabled={deleteCategory.isPending}
                                    >
                                        {deleteCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Default Categories Section */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-foreground">Categorias Padrão</h2>
                        <p className="text-sm text-muted-foreground">Categorias pré-definidas do sistema</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standardCategories.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">{cat.icon}</span>
                                    <span className="font-medium text-foreground">{cat.name}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground font-medium border border-border">
                                    padrão
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Categorias;

