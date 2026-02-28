import { Bell, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  title: string;
  count: number;
}

interface RemindersBannerProps {
  reminders: Reminder[];
  expanded?: boolean;
  onToggle?: () => void;
}

export function RemindersBanner({ reminders, expanded = false, onToggle }: RemindersBannerProps) {
  const totalPending = reminders.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="bg-card rounded-xl border border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Lembretes dos próximos 7 dias</p>
            <p className="text-xs text-muted-foreground">
              {totalPending} transação pendente
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}
