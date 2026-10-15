import{an as q,j as e,a3 as A,az as y,Q as L,bn as f,a0 as T,af as R,ai as p,al as x,aj as _,ak as k,$ as g,as as V,bm as M,aH as $,aI as K,aJ as H,D as G,aY as U,B as O,bu as Q,h as J,i as Y,k as W,r as l,c0 as X,c1 as Z,c4 as ee,b_ as ae,c2 as ie,L as D,m as F,U as v,a as b,aq as re}from"./index-DBgGkI22.js";import{A as se}from"./AdminHeader-enzFtZrQ.js";import{A as te}from"./AdminLoadingState-C-kvsJ83.js";import"./table-C0Pi3FQJ.js";import{U as I}from"./user-plus-CqWDuIxt.js";import{C as j}from"./circle-alert-nbCzz-3f.js";import{C as B}from"./circle-check-big-xAZjcKca.js";import{M as z}from"./mail-D72UgsvB.js";import{S as ne}from"./share-2-DmN3mlll.js";import{S}from"./send-Dx-NgTQ7.js";import{S as oe}from"./scroll-area-C0nrQVXU.js";import{T as de}from"./textarea-Dmxa8WL1.js";import{P as le}from"./pen-line-D15tEtpl.js";import{L as ce}from"./loader-circle-CIXpAym6.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=q("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]),C={trial:{bg:"bg-blue-500/10",text:"text-blue-500",label:"Trial"},payment:{bg:"bg-green-500/10",text:"text-green-500",label:"Pagamento"},reminder:{bg:"bg-orange-500/10",text:"text-orange-500",label:"Lembrete"},feature:{bg:"bg-purple-500/10",text:"text-purple-500",label:"Recurso"},default:{bg:"bg-gray-500/10",text:"text-gray-500",label:""}},h=[{id:"welcome",name:"Boas-vindas",description:"Enviado quando o usuário se cadastra",timing:"Imediato (no cadastro)",icon:e.jsx(I,{className:"h-5 w-5 text-green-500"}),deduplication:!1,automated:!1,category:"trial"},{id:"trial_expiring",name:"Trial Expirando",description:"Aviso de que o trial expira amanhã",timing:"D-1 (1 dia antes do fim)",icon:e.jsx(A,{className:"h-5 w-5 text-amber-500"}),deduplication:!1,automated:!0,category:"trial",statsKey:"trial_expiring_tomorrow"},{id:"trial_expired",name:"Trial Expirado",description:"Aviso de que o trial expirou",timing:"D+0 (dia seguinte ao fim)",icon:e.jsx(j,{className:"h-5 w-5 text-red-500"}),deduplication:!0,automated:!0,category:"trial",statsKey:"trial_expired_yesterday"},{id:"trial_expired_reminder",name:"Lembrete D+5 (Planilhas vs Bússola)",description:"Email de persuasão comparando planilhas com o app",timing:"D+5 (5 dias após expirar)",icon:e.jsx(y,{className:"h-5 w-5 text-blue-500"}),deduplication:!0,automated:!0,category:"trial",statsKey:"trial_expired_5_days"},{id:"trial_last_chance",name:"Última Chance D+10",description:"Email de urgência com última chance de aproveitar a promoção",timing:"D+10 (10 dias após expirar)",icon:e.jsx(j,{className:"h-5 w-5 text-red-600"}),deduplication:!0,automated:!0,category:"trial",statsKey:"trial_expired_10_days"},{id:"payment_success",name:"Pagamento Confirmado",description:"Confirmação de pagamento bem-sucedido",timing:"Imediato (após pagamento)",icon:e.jsx(B,{className:"h-5 w-5 text-green-500"}),deduplication:!0,automated:!1,category:"payment"},{id:"subscription_renewal_reminder",name:"Renovação em 5 dias",description:"Lembrete de renovação automática de assinatura",timing:"D-5 (5 dias antes da renovação)",icon:e.jsx(L,{className:"h-5 w-5 text-violet-500"}),deduplication:!0,automated:!0,category:"payment",statsKey:"subscribers_renewing_5_days"},{id:"payment_reminder",name:"Lembrete de Pagamento",description:"Lembrete de despesa que vence amanhã",timing:"D-1 (1 dia antes do vencimento)",icon:e.jsx(f,{className:"h-5 w-5 text-orange-500"}),deduplication:!1,automated:!0,category:"reminder",statsKey:"transactions_due_tomorrow"},{id:"credit_card_reminder",name:"Fatura do Cartão",description:"Lembrete de fatura do cartão de crédito",timing:"D-1 (1 dia antes do vencimento)",icon:e.jsx(T,{className:"h-5 w-5 text-purple-500"}),deduplication:!1,automated:!0,category:"reminder",statsKey:"credit_cards_due_tomorrow"},{id:"joint_account_feature",name:"Recurso Conta Conjunta",description:"Aviso sobre lembretes individuais para membros",timing:"D+1 (dia após pagamento)",icon:e.jsx(R,{className:"h-5 w-5 text-cyan-500"}),deduplication:!0,automated:!0,category:"feature",statsKey:"joint_accounts_pending_emails"},{id:"password_reset",name:"Redefinição de Senha",description:"Link para redefinir senha",timing:"Imediato (sob demanda)",icon:e.jsx(z,{className:"h-5 w-5 text-gray-500"}),deduplication:!1,automated:!1,category:"feature"},{id:"trial_extension",name:"Extensão de Trial",description:"Notificação de extensão de trial pelo admin",timing:"Manual (via admin)",icon:e.jsx(me,{className:"h-5 w-5 text-indigo-500"}),deduplication:!1,automated:!1,category:"trial"},{id:"trial_feature_day1_reminders",name:"Trial Dia 1: Lembretes",description:"Email sobre a funcionalidade de lembretes automáticos",timing:"D+1 (1º dia de trial)",icon:e.jsx(f,{className:"h-5 w-5 text-orange-500"}),deduplication:!0,automated:!0,category:"trial",statsKey:"trial_day_1"},{id:"trial_feature_day2_credit_card",name:"Trial Dia 2: Importar Fatura",description:"Email sobre importação de fatura de cartão por IA",timing:"D+2 (2º dia de trial)",icon:e.jsx(T,{className:"h-5 w-5 text-purple-500"}),deduplication:!0,automated:!0,category:"trial",statsKey:"trial_day_2"},{id:"trial_feature_day3_ai_assistant",name:"Trial Dia 3: IA Bússola",description:"Email sobre o assistente financeiro com IA",timing:"D+3 (3º dia de trial)",icon:e.jsx(y,{className:"h-5 w-5 text-blue-500"}),deduplication:!0,automated:!0,category:"trial",statsKey:"trial_day_3"},{id:"referral_program",name:"Programa de Indicações",description:"Apresenta o programa de indicação para o usuário",timing:"2º acesso (após primeiro login)",icon:e.jsx(ne,{className:"h-5 w-5 text-green-500"}),deduplication:!0,automated:!0,category:"feature"}],pe=({stats:a,loading:n})=>{const i=h.reduce((r,o)=>(r[o.category]=(r[o.category]||0)+1,r),{}),s=h.filter(r=>r.automated).length,t=h.filter(r=>!r.automated).length,c=a?(a.trial_expiring_tomorrow||0)+(a.trial_expired_yesterday||0)+(a.trial_expired_5_days||0)+(a.trial_expired_10_days||0)+(a.transactions_due_tomorrow||0)+(a.credit_cards_due_tomorrow||0)+(a.subscribers_renewing_5_days||0):0;return e.jsxs("div",{className:"space-y-4 sm:space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[e.jsx(p,{className:"border-l-4 border-l-primary",children:e.jsx(x,{className:"p-3 sm:p-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 rounded-lg bg-primary/10",children:e.jsx(S,{className:"h-5 w-5 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-2xl sm:text-3xl font-bold",children:c}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Emails pendentes"})]})]})})}),e.jsx(p,{className:"border-l-4 border-l-blue-500",children:e.jsx(x,{className:"p-3 sm:p-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 rounded-lg bg-blue-500/10",children:e.jsx(A,{className:"h-5 w-5 text-blue-500"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-2xl sm:text-3xl font-bold",children:(a==null?void 0:a.trial_active)||0}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Trials ativos"})]})]})})}),e.jsx(p,{className:"border-l-4 border-l-amber-500",children:e.jsx(x,{className:"p-3 sm:p-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 rounded-lg bg-amber-500/10",children:e.jsx(j,{className:"h-5 w-5 text-amber-500"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-2xl sm:text-3xl font-bold",children:(a==null?void 0:a.trial_expiring_tomorrow)||0}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Expiram amanhã"})]})]})})}),e.jsx(p,{className:"border-l-4 border-l-orange-500",children:e.jsx(x,{className:"p-3 sm:p-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 rounded-lg bg-orange-500/10",children:e.jsx(f,{className:"h-5 w-5 text-orange-500"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-2xl sm:text-3xl font-bold",children:((a==null?void 0:a.transactions_due_tomorrow)||0)+((a==null?void 0:a.credit_cards_due_tomorrow)||0)}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Lembretes D-1"})]})]})})})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsxs(p,{children:[e.jsx(_,{className:"pb-3",children:e.jsxs(k,{className:"text-sm font-medium flex items-center gap-2",children:[e.jsx(z,{className:"h-4 w-4"}),"Distribuição por Categoria"]})}),e.jsxs(x,{className:"pt-0",children:[e.jsx("div",{className:"grid grid-cols-2 gap-3",children:Object.keys(i).map(r=>{const o=C[r]||C.default;return e.jsxs("div",{className:`p-3 rounded-lg ${o.bg} flex items-center justify-between`,children:[e.jsx("span",{className:`text-sm font-medium ${o.text}`,children:o.label}),e.jsx(g,{variant:"secondary",className:"text-sm",children:i[r]})]},r)})}),e.jsxs("div",{className:"flex items-center justify-between mt-4 pt-4 border-t",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded-full bg-primary"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Automáticos"}),e.jsx(g,{variant:"outline",children:s})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded-full bg-muted-foreground"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Manuais"}),e.jsx(g,{variant:"outline",children:t})]})]})]})]}),e.jsxs(p,{children:[e.jsx(_,{className:"pb-3",children:e.jsxs(k,{className:"text-sm font-medium flex items-center gap-2",children:[e.jsx(y,{className:"h-4 w-4"}),"Estatísticas Detalhadas"]})}),e.jsx(x,{className:"pt-0",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between p-2 rounded-lg bg-muted/50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(R,{className:"h-4 w-4 text-cyan-500"}),e.jsx("span",{className:"text-sm",children:"Contas conjuntas pendentes"})]}),e.jsx("span",{className:"font-semibold",children:(a==null?void 0:a.joint_accounts_pending_emails)||0})]}),e.jsxs("div",{className:"flex items-center justify-between p-2 rounded-lg bg-muted/50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(L,{className:"h-4 w-4 text-violet-500"}),e.jsx("span",{className:"text-sm",children:"Renovações em 5 dias"})]}),e.jsx("span",{className:"font-semibold",children:(a==null?void 0:a.subscribers_renewing_5_days)||0})]}),e.jsxs("div",{className:"flex items-center justify-between p-2 rounded-lg bg-muted/50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(f,{className:"h-4 w-4 text-orange-500"}),e.jsx("span",{className:"text-sm",children:"Campanha Trial Dia 1"})]}),e.jsx("span",{className:"font-semibold",children:(a==null?void 0:a.trial_day_1)||0})]}),e.jsxs("div",{className:"flex items-center justify-between p-2 rounded-lg bg-muted/50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(f,{className:"h-4 w-4 text-purple-500"}),e.jsx("span",{className:"text-sm",children:"Campanha Trial Dia 2"})]}),e.jsx("span",{className:"font-semibold",children:(a==null?void 0:a.trial_day_2)||0})]}),e.jsxs("div",{className:"flex items-center justify-between p-2 rounded-lg bg-muted/50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(f,{className:"h-4 w-4 text-blue-500"}),e.jsx("span",{className:"text-sm",children:"Campanha Trial Dia 3"})]}),e.jsx("span",{className:"font-semibold",children:(a==null?void 0:a.trial_day_3)||0})]})]})})]})]})]})},xe=({stats:a})=>{const n=[{icon:e.jsx(I,{className:"h-4 w-4"}),label:"Cadastro",sublabel:"Boas-vindas",color:"bg-green-500/10 text-green-600 border-green-500/30",count:null},{icon:e.jsx(A,{className:"h-4 w-4"}),label:"D-1",sublabel:"Trial expirando",color:"bg-amber-500/10 text-amber-600 border-amber-500/30",count:(a==null?void 0:a.trial_expiring_tomorrow)||0},{icon:e.jsx(j,{className:"h-4 w-4"}),label:"D+0",sublabel:"Trial expirado",color:"bg-red-500/10 text-red-600 border-red-500/30",count:(a==null?void 0:a.trial_expired_yesterday)||0},{icon:e.jsx(y,{className:"h-4 w-4"}),label:"D+5",sublabel:"Persuasão",color:"bg-blue-500/10 text-blue-600 border-blue-500/30",count:(a==null?void 0:a.trial_expired_5_days)||0},{icon:e.jsx(j,{className:"h-4 w-4"}),label:"D+10",sublabel:"Última chance",color:"bg-red-600/10 text-red-700 border-red-600/30",count:(a==null?void 0:a.trial_expired_10_days)||0},{icon:e.jsx(B,{className:"h-4 w-4"}),label:"Conversão",sublabel:"Pagamento",color:"bg-primary/10 text-primary border-primary/30",count:null}];return e.jsxs(p,{children:[e.jsxs(_,{className:"pb-2 sm:pb-4",children:[e.jsxs(k,{className:"text-sm sm:text-base flex items-center gap-2",children:[e.jsx(y,{className:"h-4 w-4 sm:h-5 sm:w-5"}),"Fluxo da Régua de Emails"]}),e.jsx(V,{className:"text-xs sm:text-sm",children:"Jornada do trial até a conversão"})]}),e.jsx(x,{className:"pt-0",children:e.jsx("div",{className:"overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2",children:e.jsx("div",{className:"flex items-center gap-2 min-w-max",children:n.map((i,s)=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("div",{className:`flex flex-col items-center p-3 rounded-lg border ${i.color} min-w-[80px] sm:min-w-[100px]`,children:[e.jsxs("div",{className:"flex items-center gap-1.5 mb-1",children:[i.icon,e.jsx("span",{className:"font-semibold text-sm",children:i.label})]}),e.jsx("span",{className:"text-[10px] sm:text-xs opacity-75 text-center",children:i.sublabel}),i.count!==null&&e.jsx(g,{variant:"secondary",className:"mt-2 text-xs font-bold",children:i.count})]}),s<n.length-1&&e.jsx(M,{className:"h-4 w-4 text-muted-foreground shrink-0"})]},s))})})})]})},ge=({selectedCategory:a,onCategoryChange:n})=>{const i=t=>t==="all"?h.length:h.filter(c=>c.category===t).length,s=[{value:"all",label:"Todos"},{value:"trial",label:"Trial"},{value:"payment",label:"Pagamento"},{value:"reminder",label:"Lembrete"},{value:"feature",label:"Recurso"}];return e.jsx($,{value:a,onValueChange:n,children:e.jsx(K,{className:"w-full sm:w-auto h-auto p-1 flex flex-wrap gap-1 justify-start bg-muted/50",children:s.map(t=>e.jsxs(H,{value:t.value,className:"text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",children:[t.label,e.jsx(g,{variant:"secondary",className:"ml-1.5 h-5 px-1.5 text-[10px]",children:i(t.value)})]},t.value))})})},ue={welcome:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Seja muito bem-vindo(a) à <strong>Bússola Financeira</strong>!</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>🎯 Com a Bússola Financeira você pode:</strong></p>
          <ul>
            <li>Controlar suas receitas e despesas</li>
            <li>Gerenciar cartões de crédito</li>
            <li>Acompanhar seus investimentos</li>
          </ul>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Minha Conta</a></center>
      </div>
    </div>
  `,trial_expiring:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Seu período de teste gratuito expira em <strong>1 dia</strong>.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p><strong>⚡ Lote 1 esgotado! Lote 2 disponível:</strong></p>
          <ul>
            <li><strong>R$ 5,90/mês</strong> - Plano mensal</li>
            <li><strong>R$ 25,97/ano</strong> - Apenas R$ 2,16 por mês!</li>
          </ul>
          <p style="color: #dc2626; font-weight: bold;">⚡ Vagas limitadas!</p>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Garantir Minha Vaga</a></center>
      </div>
    </div>
  `,trial_expired:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Seu período de teste gratuito na Bússola Financeira <strong>expirou</strong>.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p><strong>😔 Você está perdendo o controle das suas finanças!</strong></p>
          <ul>
            <li>Adicionar novas transações</li>
            <li>Gerenciar seus cartões</li>
            <li>Receber lembretes de pagamento</li>
          </ul>
        </div>
        <p>A boa notícia é que <strong>seus dados estão seguros</strong>!</p>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Garantir Minha Vaga na Promoção</a></center>
      </div>
    </div>
  `,trial_expired_reminder:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Sentimos sua falta! Queremos te mostrar o que você está perdendo.</p>
        <h3 style="color: #dc2626;">❌ Planilhas: O pesadelo financeiro</h3>
        <ul style="color: #6b7280;">
          <li>Precisa atualizar manualmente todo dia</li>
          <li>Fórmulas quebram e você perde dados</li>
          <li>Sem lembretes de pagamentos</li>
        </ul>
        <h3 style="color: #10b981;">✅ Bússola Financeira: Controle sem esforço</h3>
        <ul>
          <li><strong>Adiciona transação em segundos</strong></li>
          <li><strong>Lembretes automáticos</strong></li>
          <li><strong>Importa fatura do cartão</strong></li>
        </ul>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p><strong>💰 Tudo isso por menos de R$ 2 por mês!</strong></p>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Quero Voltar a Usar</a></center>
      </div>
    </div>
  `,payment_success:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Parabéns, [Nome]! 🎉</h2>
        <p>Seu pagamento foi confirmado com sucesso!</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>✨ Você agora é assinante do Bússola Financeira!</strong></p>
          <p>Aproveite todas as funcionalidades para organizar suas finanças pessoais.</p>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Minha Conta</a></center>
      </div>
    </div>
  `,subscription_renewal_reminder:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Sua assinatura será renovada automaticamente em <strong>5 dias</strong>.</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>✨ Obrigado por fazer parte da comunidade Bússola!</strong></p>
          <ul>
            <li>Controle completo de receitas e despesas</li>
            <li>Gerenciamento de cartões de crédito</li>
            <li>Lembretes automáticos de pagamento</li>
          </ul>
        </div>
        <p><strong>📋 Nenhuma ação necessária!</strong> A renovação será processada automaticamente.</p>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Minha Conta</a></center>
      </div>
    </div>
  `,trial_last_chance:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Já se passaram <strong>10 dias</strong> desde que seu período de teste terminou...</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;"><strong>⚠️ Esta é sua ÚLTIMA CHANCE!</strong></p>
          <p style="margin-top: 10px;">A promoção de lançamento está acabando.</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <p style="text-decoration: line-through; color: #6b7280; margin-bottom: 5px;">De R$ 70,80/ano</p>
          <p style="font-size: 32px; font-weight: bold; color: #10b981; margin: 0;">R$ 25,97/ano</p>
          <p style="color: #6b7280; font-size: 14px;">Apenas R$ 2,16 por mês!</p>
        </div>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>🎁 O que você ganha:</strong></p>
          <ul>
            <li>✅ Controle total de receitas e despesas</li>
            <li>✅ Lembretes automáticos de pagamento</li>
            <li>✅ Assistente financeiro com IA</li>
          </ul>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">GARANTIR MINHA VAGA AGORA</a></center>
        <p style="color: #dc2626; font-size: 14px; text-align: center; margin-top: 20px;">
          <strong>⏰ Restam poucas vagas na promoção!</strong>
        </p>
      </div>
    </div>
  `,payment_reminder:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Você tem um pagamento que vence <strong>amanhã</strong>:</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>📋 [Descrição da Transação]</strong></p>
          <p style="font-size: 24px; color: #dc2626; font-weight: bold;">R$ 150,00</p>
          <p style="color: #6b7280;">Vencimento: 20/12/2025</p>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver Minhas Transações</a></center>
      </div>
    </div>
  `,credit_card_reminder:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>A fatura do seu cartão vence <strong>amanhã</strong>:</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>💳 [Nome do Cartão]</strong></p>
          <p style="font-size: 24px; color: #dc2626; font-weight: bold;">R$ 1.250,00</p>
          <p style="color: #6b7280;">Vencimento: dia 15 de cada mês</p>
        </div>
        <p>Não esqueça de efetuar o pagamento para evitar juros!</p>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver Meus Cartões</a></center>
      </div>
    </div>
  `,joint_account_feature:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Temos uma <strong>novidade especial</strong> para você que usa conta conjunta!</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>🎉 Lembretes de pagamento individuais!</strong></p>
          <p>Cada integrante pode receber lembretes no seu próprio email.</p>
        </div>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📝 Como configurar:</strong></p>
          <ol>
            <li>Acesse Configurações</li>
            <li>Vá em "Integrantes da Conta Conjunta"</li>
            <li>Adicione o email de cada integrante</li>
          </ol>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Configurar Emails Agora</a></center>
      </div>
    </div>
  `,password_reset:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p><strong>⚠️ Se você não solicitou esta alteração, ignore este email.</strong></p>
        </div>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Redefinir Minha Senha</a></center>
        <p style="color: #6b7280; font-size: 14px; text-align: center;">Este link expira em 1 hora.</p>
      </div>
    </div>
  `,trial_extension:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]! 🎁</h2>
        <p>Temos uma surpresa para você!</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p><strong>🎉 Seu trial foi estendido!</strong></p>
          <p>Você ganhou mais dias para aproveitar o Bússola Financeira gratuitamente.</p>
        </div>
        <p>Continue organizando suas finanças e aproveite ao máximo!</p>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Continuar Usando</a></center>
      </div>
    </div>
  `,trial_feature_day1_reminders:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]! 👋</h2>
        <p>Você está no <strong>dia 1</strong> do seu período de teste. Hoje quero te mostrar uma funcionalidade incrível:</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="font-size: 20px; font-weight: bold;">🔔 Lembretes Automáticos</p>
          <p>A Bússola Financeira envia lembretes automáticos no dia anterior ao vencimento de cada conta.</p>
        </div>
        <p><strong>O que você ganha:</strong></p>
        <ul>
          <li>✅ Receba alertas por email antes de cada pagamento vencer</li>
          <li>✅ Cada integrante da conta conjunta pode receber seus próprios lembretes</li>
          <li>✅ Lembretes de faturas de cartão de crédito incluídos</li>
          <li>✅ Nunca mais pague multas por esquecimento</li>
        </ul>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Configurar Meus Lembretes</a></center>
      </div>
    </div>
  `,trial_feature_day2_credit_card:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]! 👋</h2>
        <p>Você está no <strong>dia 2</strong> do seu período de teste. Hoje quero te mostrar uma funcionalidade incrível:</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="font-size: 20px; font-weight: bold;">💳 Importação de Fatura por IA</p>
          <p>Nossa IA lê o PDF da sua fatura e cadastra todas as despesas automaticamente. Sem digitar nada!</p>
        </div>
        <p><strong>O que você ganha:</strong></p>
        <ul>
          <li>✅ Basta enviar o PDF da fatura pelo app</li>
          <li>✅ A IA identifica cada compra, valor e categoria</li>
          <li>✅ Categorização automática inteligente</li>
          <li>✅ Economize horas de digitação manual</li>
        </ul>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Importar Minha Primeira Fatura</a></center>
      </div>
    </div>
  `,trial_feature_day3_ai_assistant:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]! 👋</h2>
        <p>Você está no <strong>dia 3</strong> do seu período de teste. Hoje quero te mostrar uma funcionalidade incrível:</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="font-size: 20px; font-weight: bold;">🤖 IA Bússola - Assistente Financeiro</p>
          <p>Converse com a IA Bússola para tirar dúvidas, analisar seus gastos e receber dicas personalizadas.</p>
        </div>
        <p><strong>O que você ganha:</strong></p>
        <ul>
          <li>✅ Pergunte sobre seus gastos: "Quanto gastei com alimentação este mês?"</li>
          <li>✅ Receba análises personalizadas das suas finanças</li>
          <li>✅ Dicas de economia baseadas no seu perfil</li>
          <li>✅ Disponível 24h para te ajudar</li>
        </ul>
        <center><a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Conversar com a IA Bússola</a></center>
      </div>
    </div>
  `,referral_program:`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0;">Bússola Financeira</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Olá, [Nome]!</h2>
        <p>Temos uma <strong>novidade especial</strong> para você!</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: bold;">🎁 Programa de Indicações</p>
          <p>Agora você pode indicar o Bússola Financeira para seus amigos e familiares!</p>
        </div>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #6b7280; margin-bottom: 8px; font-size: 14px;">Seu código de indicação:</p>
          <p style="font-size: 28px; font-weight: bold; color: #10b981; margin: 0; letter-spacing: 2px;">ABC123XY</p>
        </div>
        <p><strong>Como indicar:</strong></p>
        <ol>
          <li>Compartilhe seu link exclusivo com amigos</li>
          <li>Eles se cadastram e testam por 7 dias grátis</li>
          <li>Você acompanha quantas pessoas indicou no app</li>
        </ol>
        <center><a href="#" style="display: inline-block; background: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">📲 Indicar pelo WhatsApp</a></center>
      </div>
    </div>
  `},he=({email:a,stats:n})=>{const i=C[a.category]||C.default,s=a.statsKey&&n?n[a.statsKey]:null;return e.jsx(p,{className:"overflow-hidden hover:shadow-md transition-shadow",children:e.jsx(x,{className:"p-0",children:e.jsxs("div",{className:"flex flex-col sm:flex-row",children:[e.jsx("div",{className:`w-full sm:w-1.5 h-1.5 sm:h-auto ${i.bg.replace("/10","")}`}),e.jsx("div",{className:"flex-1 p-3 sm:p-4",children:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-3",children:[e.jsxs("div",{className:"flex items-start gap-3 flex-1",children:[e.jsx("div",{className:`p-2 rounded-lg ${i.bg} shrink-0`,children:a.icon}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap mb-1",children:[e.jsx("h3",{className:"font-semibold text-sm sm:text-base",children:a.name}),e.jsx(g,{variant:"outline",className:`${i.bg} ${i.text} text-[10px] sm:text-xs border-0`,children:i.label})]}),e.jsx("p",{className:"text-xs sm:text-sm text-muted-foreground line-clamp-2",children:a.description}),e.jsxs("div",{className:"flex items-center gap-1.5 mt-2 flex-wrap",children:[a.automated?e.jsxs(g,{variant:"secondary",className:"text-[10px] h-5 px-1.5 gap-0.5",children:[e.jsx(S,{className:"h-2.5 w-2.5"}),"Automático"]}):e.jsx(g,{variant:"outline",className:"text-[10px] h-5 px-1.5 gap-0.5 text-muted-foreground",children:"Manual"}),a.deduplication&&e.jsxs(g,{variant:"outline",className:"text-[10px] h-5 px-1.5 gap-0.5 text-green-600 border-green-200",children:[e.jsx(B,{className:"h-2.5 w-2.5"}),"Deduplicação"]}),e.jsxs("span",{className:"text-[10px] text-muted-foreground flex items-center gap-0.5",children:[e.jsx(A,{className:"h-2.5 w-2.5"}),a.timing]})]})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-0",children:[s!==null?e.jsxs("div",{className:"text-left sm:text-right",children:[e.jsx("p",{className:"text-xl sm:text-2xl font-bold text-primary",children:s}),e.jsx("p",{className:"text-[10px] text-muted-foreground",children:"contatos"})]}):e.jsx("div",{className:"text-left sm:text-right",children:e.jsx("p",{className:"text-xs text-muted-foreground",children:"Sob demanda"})}),e.jsxs(G,{children:[e.jsx(U,{asChild:!0,children:e.jsxs(O,{variant:"outline",size:"sm",className:"h-8 px-3 text-xs",children:[e.jsx(Q,{className:"h-3.5 w-3.5 mr-1.5"}),"Preview"]})}),e.jsxs(J,{className:"max-w-[95vw] sm:max-w-3xl max-h-[85vh]",children:[e.jsx(Y,{children:e.jsxs(W,{className:"flex items-center gap-2",children:[a.icon,a.name]})}),e.jsx(oe,{className:"h-[65vh]",children:e.jsx("div",{className:"bg-gray-100 p-4 rounded-lg",dangerouslySetInnerHTML:{__html:ue[a.id]||'<p class="text-center text-gray-500">Preview não disponível</p>'}})})]})]})]})]})})]})})})},be=()=>{const[a,n]=l.useState(""),[i,s]=l.useState(""),[t,c]=l.useState(""),[r,o]=l.useState(!1),[w,N]=l.useState(!1),E=async()=>{if(!a.trim()||!i.trim()||!t.trim()){v.error("Preencha todos os campos");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.trim())){v.error("Email inválido");return}o(!0);try{const{data:d,error:m}=await b.functions.invoke("send-custom-email",{body:{to:a.trim(),subject:i.trim(),body:t.trim()}});if(m)throw m;v.success(`Email enviado para ${a}`),n(""),s(""),c("")}catch(d){console.error("Error sending custom email:",d),v.error("Erro ao enviar email")}finally{o(!1)}};return e.jsx(X,{open:w,onOpenChange:N,children:e.jsxs(p,{children:[e.jsx(Z,{asChild:!0,children:e.jsx(_,{className:"pb-3 cursor-pointer hover:bg-muted/50 transition-colors",children:e.jsxs(k,{className:"text-sm font-medium flex items-center gap-2",children:[e.jsx(le,{className:"h-4 w-4"}),"Enviar Email Personalizado",w?e.jsx(ee,{className:"h-4 w-4 ml-auto"}):e.jsx(ae,{className:"h-4 w-4 ml-auto"})]})})}),e.jsx(ie,{children:e.jsxs(x,{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"email-to",children:"Destinatário"}),e.jsx(F,{id:"email-to",type:"email",placeholder:"email@exemplo.com",value:a,onChange:u=>n(u.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"email-subject",children:"Assunto"}),e.jsx(F,{id:"email-subject",placeholder:"Assunto do email",value:i,onChange:u=>s(u.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"email-body",children:"Mensagem"}),e.jsx(de,{id:"email-body",placeholder:"Escreva sua mensagem aqui...",value:t,onChange:u=>c(u.target.value),className:"min-h-[200px]"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"O email será enviado com o template visual da Bússola Financeira."})]}),e.jsxs(O,{onClick:E,disabled:r,className:"w-full",children:[r?e.jsx(ce,{className:"h-4 w-4 animate-spin mr-2"}):e.jsx(S,{className:"h-4 w-4 mr-2"}),r?"Enviando...":"Enviar Email"]})]})})]})})},Te=()=>{const a=re(),[n,i]=l.useState(!0),[s,t]=l.useState(null),[c,r]=l.useState(!0),[o,w]=l.useState("all");l.useEffect(()=>{r(!1)},[]);const N=async()=>{i(!0);try{const{data:d,error:m}=await b.functions.invoke("admin-email-stats");if(m)throw m;t(d)}catch(d){console.error("Error fetching email stats:",d),v.error("Erro ao carregar estatísticas")}finally{i(!1)}};l.useEffect(()=>{c||N()},[c]);const E=async()=>{await b.auth.signOut(),console.warn("Blocked redirect to admin-login")},u=o==="all"?h:h.filter(d=>d.category===o);return c?e.jsx(te,{message:"Verificando acesso..."}):e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl",children:[e.jsx(se,{title:"Régua de Emails",subtitle:"Automações e templates de comunicação",showBackButton:!0,backTo:"/admin",onRefresh:N,onLogout:E,loading:n}),e.jsxs("div",{className:"space-y-4 sm:space-y-6",children:[e.jsx(be,{}),e.jsx(pe,{stats:s,loading:n}),e.jsx(xe,{stats:s}),e.jsx(ge,{selectedCategory:o,onCategoryChange:w}),e.jsx("div",{className:"space-y-3",children:u.map(d=>e.jsx(he,{email:d,stats:s},d.id))})]})]})})};export{Te as default};
