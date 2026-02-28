import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useDate } from "@/contexts/DateContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { selectedDate, prevMonth, nextMonth } = useDate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-56"
        )}
      >
        <Header
          currentMonth={months[selectedDate.getMonth()]}
          currentYear={selectedDate.getFullYear()}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Help button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
        <span className="text-lg">?</span>
      </button>
    </div>
  );
}
