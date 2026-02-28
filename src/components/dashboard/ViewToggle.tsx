import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, BarChart3 } from "lucide-react";

interface ViewToggleProps {
  value: "mensal" | "anual";
  onChange: (value: "mensal" | "anual") => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1">
      <button
        onClick={() => onChange("mensal")}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors",
          value === "mensal"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Calendar className="w-4 h-4" />
        Mensal
      </button>
      <button
        onClick={() => onChange("anual")}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors",
          value === "anual"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <BarChart3 className="w-4 h-4" />
        Anual
      </button>
    </div>
  );
}
