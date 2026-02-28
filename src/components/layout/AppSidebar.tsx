import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Plus,
  LayoutGrid,
  FileText,
  LineChart,
  CreditCard,
  TrendingUp,
  Upload,
  Tags,
  Users,
  Sparkles,
  MessageSquare,
  Wallet,
  Target,
  Goal,
  BarChart3,
  GitCompare,
  Banknote,
} from "lucide-react";
import { BussolaLogo } from "@/components/icons/BussolaLogo";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuSections = [
  {
    title: "Atalhos",
    items: [
      { icon: Plus, label: "Nova Transação", href: "/nova-transacao", isButton: true },
    ],
  },
  {
    title: "BALANÇO",
    items: [
      { icon: LayoutGrid, label: "Balanço Mensal", href: "/" },
      { icon: FileText, label: "Extrato", href: "/extrato" },
      { icon: LineChart, label: "Gráficos", href: "/graficos" },
    ],
  },
  {
    title: "FINANÇAS",
    items: [
      { icon: CreditCard, label: "Cartões de Crédito", href: "/cartoes" },
      { icon: TrendingUp, label: "Investimentos", href: "/investimentos" },
      { icon: Banknote, label: "Dívidas", href: "/dividas", isNew: true },
      { icon: Upload, label: "Importar Transações", href: "/importar" },
      { icon: Tags, label: "Categorias", href: "/categorias" },
      { icon: Users, label: "Ligas", href: "/ligas" },
    ],
  },
  {
    title: "FERRAMENTAS PRO",
    isPro: true,
    items: [
      { icon: MessageSquare, label: "Assistente IA", href: "/assistente", isAI: true },
      { icon: Wallet, label: "Minha Carteira", href: "/carteira", isNew: true },
      { icon: Target, label: "Limites por Categoria", href: "/limites" },
      { icon: Goal, label: "Metas Financeiras", href: "/metas" },
      { icon: BarChart3, label: "Insights e Análises", href: "/insights" },
      { icon: GitCompare, label: "Comparativo", href: "/comparativo" },
    ],
  },
];

export function AppSidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <BussolaLogo className="w-8 h-8 flex-shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-foreground">Bússola</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-sidebar-muted transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-4 overflow-y-auto h-[calc(100vh-3.5rem)]">
        {menuSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="flex items-center gap-1 px-2 mb-2">
                {section.isPro && (
                  <Sparkles className="w-3 h-3 text-primary" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium tracking-wide",
                    section.isPro ? "text-primary" : "text-sidebar-muted"
                  )}
                >
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    item.isButton
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  activeClassName={!item.isButton ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      item.isAI && "text-primary"
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.isNew && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                      novo
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Collapse hint */}
        {!collapsed && (
          <div className="px-2 pt-4">
            <span className="text-xs text-sidebar-muted">Ctrl+B para recolher</span>
          </div>
        )}
      </nav>
    </aside>
  );
}
