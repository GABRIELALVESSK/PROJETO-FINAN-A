# 🚀 INSTRUÇÕES PARA CRIAR O BANCO DE DADOS

## ⚠️ URGENTE - Execute este passo para corrigir o erro de uma vez!

O erro que você está vendo acontece porque as tabelas não existem no seu Supabase.
Siga os passos abaixo para criar todas as tabelas de uma vez:

---

## 📋 PASSO A PASSO

### 1. Abra o Supabase Dashboard
- Acesse: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione seu projeto

### 2. Acesse o Editor SQL
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Ou acesse diretamente: https://supabase.com/dashboard/project/SEU_PROJETO_ID/sql

### 3. Execute o Script
- Clique em **"New Query"** (Nova Consulta)
- Abra o arquivo `create-database.sql` que acabei de criar
- **Copie TODO o conteúdo** do arquivo
- **Cole** no editor SQL do Supabase
- Clique em **"Run"** (Executar) no canto inferior direito

### 4. Aguarde a Confirmação
- Você verá uma mensagem verde "Success" (Sucesso)
- Isso significa que todas as tabelas foram criadas!

### 5. Teste o Sistema
- Volte para o aplicativo
- Tente adicionar uma transação novamente
- Agora deve funcionar perfeitamente! ✅

---

## 📊 O QUE ESTE SCRIPT CRIA

✅ **Tabela `profiles`** - Armazena informações dos usuários  
✅ **Tabela `accounts`** - Suas contas bancárias (Nubank, Banco do Brasil, etc)  
✅ **Tabela `transactions`** - Todas as transações (receitas e despesas)  
✅ **Suporte completo a recorrência** - Campos `is_recurring`, `frequency`, `repeat_until`  
✅ **Vínculo com contas** - Campo `account_id` para ligar transações às contas  
✅ **Índices** - Para melhor performance  
✅ **Triggers** - Atualização automática de datas  
✅ **Políticas de segurança** - Row Level Security configurado  

---

## ❓ PRECISA DE AJUDA?

Se tiver qualquer problema ao executar o script, me avise e eu te ajudo!
Você também pode enviar uma screenshot da mensagem de erro caso apareça algo.

---

## 🎉 DEPOIS DE EXECUTAR

Seu sistema estará **100% funcional** com:
- ✅ Salvar transações
- ✅ Vincular com contas bancárias
- ✅ Transações recorrentes
- ✅ Gráficos atualizados
- ✅ Extrato completo
