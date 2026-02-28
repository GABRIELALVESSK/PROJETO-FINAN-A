-- ============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Bússola Financeira
-- ============================================

-- 0. Limpeza completa para evitar erros de "já existe"
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.debt_installments CASCADE;
DROP TABLE IF EXISTS public.debts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.credit_cards CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Tabela de Perfis (Usuários)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Contas Bancárias
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bank_name TEXT,
    type TEXT,
    responsible TEXT,
    balance NUMERIC(10, 2) DEFAULT 0,
    icon TEXT DEFAULT 'building',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Cartões de Crédito
CREATE TABLE public.credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    closing_day INTEGER,
    due_day INTEGER,
    responsible TEXT,
    "limit" NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Transações
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    transfer_direction TEXT CHECK (transfer_direction IS NULL OR transfer_direction IN ('sent', 'received')),
    original_amount NUMERIC(10, 2),
    responsible TEXT,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    frequency TEXT,
    repeat_until DATE,
    status TEXT DEFAULT 'realizadas' CHECK (status IN ('realizadas', 'pendentes')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Investimentos
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('aporte', 'retirada')),
    responsible TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Dívidas
CREATE TABLE public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'emprestimo', 'cartao', 'financiamento', 'consorcio', 'informal', 'outro'
    total_value NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(10, 2),
    installments_count INTEGER NOT NULL,
    installment_value NUMERIC(15, 2),       -- valor de cada parcela (parcelas fixas)
    start_date DATE NOT NULL,
    frequency TEXT DEFAULT 'mensal' CHECK (frequency IN ('mensal', 'quinzenal', 'semanal')),
    paid_before INTEGER DEFAULT 0,          -- parcelas já pagas antes do cadastro
    interest_rate_type TEXT DEFAULT 'mensal', -- 'mensal', 'anual'
    interest_type TEXT DEFAULT 'composto',     -- 'composto', 'simples'
    amortization_system TEXT DEFAULT 'price',  -- 'price', 'sac'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid')),
    responsible TEXT,                       -- credor / instituição
    notes TEXT,                             -- observações livres
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Parcelas de Dívidas
CREATE TABLE public.debt_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Categorias
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('despesas', 'receitas')),
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_investments_date ON public.investments(date);
CREATE INDEX IF NOT EXISTS idx_investments_type ON public.investments(type);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(status);
CREATE INDEX IF NOT EXISTS idx_debt_installments_due_date ON public.debt_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_debt_installments_status ON public.debt_installments(status);

-- 9. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON public.credit_cards;
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_debts_updated_at ON public.debts;
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_debt_installments_updated_at ON public.debt_installments;
CREATE TRIGGER update_debt_installments_updated_at BEFORE UPDATE ON public.debt_installments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 12. Políticas de acesso (permite acesso total por enquanto para facilitar)
DROP POLICY IF EXISTS "Permitir acesso total a profiles" ON public.profiles;
CREATE POLICY "Permitir acesso total a profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a accounts" ON public.accounts;
CREATE POLICY "Permitir acesso total a accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a credit_cards" ON public.credit_cards;
CREATE POLICY "Permitir acesso total a credit_cards" ON public.credit_cards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a transactions" ON public.transactions;
CREATE POLICY "Permitir acesso total a transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a investments" ON public.investments;
CREATE POLICY "Permitir acesso total a investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a debts" ON public.debts;
CREATE POLICY "Permitir acesso total a debts" ON public.debts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a debt_installments" ON public.debt_installments;
CREATE POLICY "Permitir acesso total a debt_installments" ON public.debt_installments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a categories" ON public.categories;
CREATE POLICY "Permitir acesso total a categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 13. Dados de exemplo (opcional)
INSERT INTO public.profiles (full_name, email, whatsapp) 
VALUES ('Gabriel Alves', 'fofob31655@azerion.com', '(21) 96978-7023')
ON CONFLICT DO NOTHING;

-- ============================================
-- SCRIPT CONCLUÍDO
-- ============================================
