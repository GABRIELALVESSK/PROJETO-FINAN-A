import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    ChevronLeft,
    Trash2,
    User,
    Mail,
    Phone,
    Plus,
    Bell,
    Moon,
    History,
    AlertTriangle,
    Clock,
    ShieldAlert,
    Loader2,
    Building2,
    Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSupabaseData, useSupabaseUpdate, useSupabaseUpsert } from "@/hooks/useSupabase";
import { toast } from "sonner";

interface Profile {
    id: string;
    nome: string;
    email: string;
    celular: string;
    created_at?: string;
}

interface Integrante {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    tipo_trabalho: 'CLT' | 'Autônomo';
}

const Configuracoes = () => {
    const navigate = useNavigate();

    // Supabase Hooks
    const { data: profiles, isLoading: isLoadingProfile } = useSupabaseData("profiles");
    const upsertProfile = useSupabaseUpsert("profiles");

    // Local State
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [celular, setCelular] = useState("");
    const [profileId, setProfileId] = useState<string | null>(null);

    // Email editing state
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");

    // Joint Account State
    const [integrantes, setIntegrantes] = useState<Integrante[]>([
        { id: '1', nome: 'Gabriel Alves', email: 'fofob31655@azerion.com', whatsapp: '(21) 96978-7023', tipo_trabalho: 'CLT' }
    ]);
    const [novoIntegranteNome, setNovoIntegranteNome] = useState("");

    // Initialize state when data is loaded
    useEffect(() => {
        if (profiles && (profiles as any[]).length > 0) {
            const profile = (profiles as any)[0];
            // Tentando 'full_name' ou 'nome' ou qualquer campo que pareça um nome
            setNome(profile.full_name || profile.nome || "");
            setEmail(profile.email || "");
            setCelular(profile.whatsapp || "");
            setProfileId(profile.id);
        }
    }, [profiles]);

    const handleSaveProfile = async () => {
        try {
            const profileData: any = {
                full_name: nome
                // Removendo whatsapp e email temporariamente até descobrirmos os nomes corretos das colunas
            };

            // Se já temos um profileId, incluímos para fazer o update
            if (profileId) {
                profileData.id = profileId;
            }

            console.log("Saving profile data:", profileData);
            await upsertProfile.mutateAsync(profileData);
            toast.success("Perfil salvo com sucesso!");
        } catch (error: any) {
            console.error(error);
            const msg = error.message || "Erro desconhecido";
            toast.error(`Erro ao salvar perfil: ${msg}`);
        }
    };

    const handleStartEmailEdit = () => {
        setNewEmail("");
        setIsEditingEmail(true);
    };

    const handleCancelEmailEdit = () => {
        setIsEditingEmail(false);
        setNewEmail("");
    };

    const handleSendVerificationCode = async () => {
        if (!newEmail || !newEmail.includes("@")) {
            toast.error("Por favor, insira um email válido.");
            return;
        }

        try {
            // Aqui você implementaria o envio do código de verificação
            // Por exemplo, usando Supabase Auth
            toast.success("Código de verificação enviado para " + newEmail);
            // Após implementar a verificação real, você atualizaria o email
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao enviar código de verificação.");
        }
    };

    const handleAddIntegrante = () => {
        if (!novoIntegranteNome.trim()) {
            toast.error("Por favor, insira o nome do integrante.");
            return;
        }

        const novo: Integrante = {
            id: Math.random().toString(36).substr(2, 9),
            nome: novoIntegranteNome,
            email: "",
            whatsapp: "",
            tipo_trabalho: 'CLT'
        };

        setIntegrantes([...integrantes, novo]);
        setNovoIntegranteNome("");
        toast.success("Integrante adicionado com sucesso!");
    };

    const handleRemoveIntegrante = (id: string) => {
        setIntegrantes(integrantes.filter(i => i.id !== id));
        toast.success("Integrante removido.");
    };

    const handleUpdateIntegrante = (id: string, field: keyof Integrante, value: string) => {
        setIntegrantes(integrantes.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
                {/* Header with Back button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Configurações</h1>
                        <p className="text-muted-foreground text-sm">Gerencie seu perfil e assinatura</p>
                    </div>
                </div>

                {/* Status da Assinatura */}
                <Card className="bg-[#FFF9F2] border-[#FDE6D2]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#FEEBC8] flex items-center justify-center text-[#975A16]">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#975A16]">Período de Teste</h3>
                                    <p className="text-sm text-[#975A16]/80">2 dias restantes • Expira em 08/02/2026 às 11:44</p>
                                </div>
                            </div>
                            <Button className="bg-[#2D9B73] hover:bg-[#258563] text-white font-semibold">
                                Fazer upgrade
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Informações Pessoais */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                        <CardDescription>Atualize seus dados de perfil</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingProfile ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-[#2D9B73]" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    {!isEditingEmail ? (
                                        <div className="relative flex items-center">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                value={email}
                                                className="pl-10 pr-20"
                                                disabled
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 text-xs text-[#2D9B73] hover:text-[#2D9B73] hover:bg-transparent"
                                                onClick={handleStartEmailEdit}
                                            >
                                                Alterar
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Novo email"
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 bg-[#2D9B73] hover:bg-[#258563] text-white"
                                                    onClick={handleSendVerificationCode}
                                                >
                                                    Enviar código
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={handleCancelEmailEdit}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Um código de verificação será enviado para o novo email.
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="celular">Celular</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="celular"
                                            value={celular}
                                            onChange={(e) => setCelular(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="bg-[#2D9B73] hover:bg-[#258563] text-white font-semibold"
                                    onClick={handleSaveProfile}
                                    disabled={upsertProfile.isPending}
                                >
                                    {upsertProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Salvar alterações
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Integrantes da Conta Conjunta */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" /> Integrantes da Conta Conjunta
                        </CardTitle>
                        <CardDescription>Gerencie os integrantes e configure emails para lembretes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {integrantes.map((int) => (
                            <div key={int.id} className="border border-border rounded-xl p-4 space-y-4 relative bg-[#F8FAFB]">
                                <div className="absolute right-4 top-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveIntegrante(int.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-4 max-w-md">
                                    <h4 className="font-bold">{int.nome}</h4>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="email@exemplo.com"
                                            value={int.email}
                                            onChange={(e) => handleUpdateIntegrante(int.id, 'email', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="(00) 00000-0000"
                                            value={int.whatsapp}
                                            onChange={(e) => handleUpdateIntegrante(int.id, 'whatsapp', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">O e-mail é usado para lembretes e o WhatsApp para registrar transações via mensagem</p>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Tipo de trabalho</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "flex-1 gap-2",
                                                    int.tipo_trabalho === 'CLT' ? "bg-[#2D9B73] text-white hover:bg-[#2D9B73] border-[#2D9B73]" : ""
                                                )}
                                                onClick={() => handleUpdateIntegrante(int.id, 'tipo_trabalho', 'CLT')}
                                            >
                                                <Building2 className="w-3 h-3" /> CLT
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "flex-1 gap-2",
                                                    int.tipo_trabalho === 'Autônomo' ? "bg-[#2D9B73] text-white hover:bg-[#2D9B73] border-[#2D9B73]" : ""
                                                )}
                                                onClick={() => handleUpdateIntegrante(int.id, 'tipo_trabalho', 'Autônomo')}
                                            >
                                                <Briefcase className="w-3 h-3" /> Autônomo
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-2">
                            <Label>Adicionar novo integrante</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nome do integrante"
                                    className="flex-1"
                                    value={novoIntegranteNome}
                                    onChange={(e) => setNovoIntegranteNome(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddIntegrante()}
                                />
                                <Button
                                    size="icon"
                                    className="bg-[#A7D7C5] hover:bg-[#2D9B73] text-white"
                                    onClick={handleAddIntegrante}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            className="bg-[#2D9B73] hover:bg-[#258563] text-white font-semibold flex items-center gap-2"
                            onClick={handleSaveProfile}
                            disabled={upsertProfile.isPending}
                        >
                            {upsertProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
                            Salvar alterações
                        </Button>
                    </CardContent>
                </Card>

                {/* Informações da Conta */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações da Conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">ID da conta</span>
                            <span className="text-sm font-mono text-muted-foreground">{profileId ? profileId.substring(0, 8) + '...' : '—'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">Conta criada em</span>
                            <span className="text-sm text-muted-foreground font-medium">
                                {profiles && (profiles as Profile[]).length > 0 && (profiles as Profile[])[0].created_at
                                    ? new Date((profiles as Profile[])[0].created_at!).toLocaleDateString('pt-BR')
                                    : '—'
                                }
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferências do App */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Preferências do App</CardTitle>
                        <CardDescription>Configurações e ajustes do aplicativo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                            <div className="flex gap-3">
                                <Bell className="w-5 h-5 text-muted-foreground mt-1" />
                                <div>
                                    <h4 className="font-medium">Notificações Push</h4>
                                    <p className="text-xs text-muted-foreground">Desativadas</p>
                                </div>
                            </div>
                            <Button size="sm" className="bg-[#2D9B73] hover:bg-[#258563] text-white">Ativar</Button>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <h4 className="font-medium">Modo escuro</h4>
                                    <p className="text-xs text-muted-foreground">Ativar tema escuro no app</p>
                                </div>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h4 className="font-medium">Tutorial do app</h4>
                                <p className="text-xs text-muted-foreground text-left">Reveja o tour de introdução</p>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <History className="w-4 h-4" /> Reiniciar tutorial
                            </Button>

                        </div>
                    </CardContent>
                </Card>

                {/* Zona de Perigo */}
                <Card className="border-red-100">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                        </CardTitle>
                        <CardDescription>Ações irreversíveis que afetam todos os dados da sua conta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-red-700">Resetar conta</h4>
                                    <p className="text-sm text-red-600/80 max-w-md">
                                        Apaga todas as transações, cartões, investimentos, metas e configurações. Sua conta permanece ativa, mas você recomeça do zero.
                                    </p>
                                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-2">
                                        <ShieldAlert className="w-3 h-3" /> Atenção: Você já utilizou o período de teste. Após resetar, NÃO será possível fazer um novo trial.
                                    </p>
                                </div>
                                <Button variant="destructive" className="bg-[#D94E38] hover:bg-[#C23C26] gap-2">
                                    <Trash2 className="w-4 h-4" /> Resetar tudo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Configuracoes;

