import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const TestSupabase = () => {
    const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [envVars, setEnvVars] = useState({
        url: !!import.meta.env.VITE_SUPABASE_URL,
        key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    });

    const testConnection = async () => {
        setStatus("testing");
        setMessage("");

        try {
            await new Promise(r => setTimeout(r, 1000));

            // Test profiles columns
            const { data: profiles, error: pError } = await supabase.from("profiles").select("*").limit(1);

            // Test transactions columns
            const { data: transactions, error: tError } = await supabase.from("transactions").select("*").limit(1);

            if (pError || tError) {
                setStatus("error");
                setMessage(`Erro: ${pError?.message || tError?.message}`);
                return;
            }

            let msg = "Conexão OK!\n\n";

            if (profiles && profiles.length > 0) {
                msg += `Colunas 'profiles': ${Object.keys(profiles[0]).join(", ")}\n\n`;
            }

            if (transactions && transactions.length > 0) {
                msg += `Colunas 'transactions': ${Object.keys(transactions[0]).join(", ")}`;
            } else {
                msg += "'transactions' está vazia.";
            }

            setStatus("success");
            setMessage(msg);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Ocorreu um erro inesperado.");
        }
    };

    return (
        <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen space-y-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Teste de Conexão Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Status das Variáveis (.env):</p>
                        <div className="flex gap-2">
                            <Badge variant={envVars.url ? "secondary" : "destructive"}>
                                URL: {envVars.url ? "Configurada" : "Faltando"}
                            </Badge>
                            <Badge variant={envVars.key ? "secondary" : "destructive"}>
                                KEY: {envVars.key ? "Configurada" : "Faltando"}
                            </Badge>
                        </div>
                    </div>

                    <Button
                        onClick={testConnection}
                        disabled={status === "testing"}
                        className="w-full"
                    >
                        {status === "testing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Testar Conexão agora
                    </Button>

                    {status === "success" && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-200">
                            <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-200">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-4 italic">
                        Nota: Este teste verifica se o cliente Supabase consegue "ouvir" o servidor.
                        Certifique-se de configurar as chaves reais no seu arquivo .env.
                    </div>
                </CardContent>
            </Card>

            <Button variant="outline" onClick={() => window.history.back()}>
                Voltar para o App
            </Button>
        </div>
    );
};

export default TestSupabase;
