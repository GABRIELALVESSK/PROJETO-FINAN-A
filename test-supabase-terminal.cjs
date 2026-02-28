const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic .env parser
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('Testando conexão com:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? '********' + supabaseAnonKey.slice(-4) : 'Faltando');

if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    console.error('\n erro: Você ainda não configurou a URL real no arquivo .env!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    try {
        console.log('\n--- Testando Profiles ---');
        const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1);
        if (pError) {
            console.error('Erro profiles:', pError.message);
        } else {
            console.log('Sucesso profiles!');
            if (pData && pData.length > 0) {
                console.log('Colunas:', Object.keys(pData[0]));
            } else {
                console.log('Tabela vazia.');
            }
        }

        console.log('\n--- Testando Transactions ---');
        const { data: tData, error: tError } = await supabase.from('transactions').select('*').limit(1);
        if (tError) {
            console.error('Erro transactions:', tError.message);
        } else {
            console.log('Sucesso transactions!');
            if (tData && tData.length > 0) {
                console.log('Colunas:', Object.keys(tData[0]));
            } else {
                console.log('Tabela vazia.');
            }
        }

        console.log('\n--- Testando Accounts ---');
        const { data: aData, error: aError } = await supabase.from('accounts').select('*').limit(1);
        if (aError) {
            console.error('Erro accounts:', aError.message);
        } else {
            console.log('Sucesso accounts!');
            if (aData && aData.length > 0) {
                console.log('Colunas:', Object.keys(aData[0]));
            } else {
                console.log('Tabela vazia.');
            }
        }
    } catch (err) {
        console.error('\nErro inesperado:', err.message);
    }
}

test();
