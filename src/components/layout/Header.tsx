import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut
} from "lucide-react";
import { BussolaLogo } from "@/components/icons/BussolaLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseData } from "@/hooks/useSupabase";

interface HeaderProps {
  currentMonth: string;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function Header({ currentMonth, currentYear, onPrevMonth, onNextMonth }: HeaderProps) {
  const navigate = useNavigate();
  const { data: profiles } = useSupabaseData("profiles");

  const userProfile = profiles && (profiles as any[]).length > 0 ? (profiles as any)[0] : null;
  const userName = userProfile?.full_name || userProfile?.nome || "Usuário";
  const userEmail = userProfile?.email || "usuario@exemplo.com";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("pt-BR", { weekday: "long" });
  const dayNumber = today.getDate().toString().padStart(2, "0");
  const monthName = today.toLocaleDateString("pt-BR", { month: "long" });

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <BussolaLogo className="w-8 h-8" />
        <div>
          <h1 className="font-semibold text-foreground">Bússola Financeira</h1>
          <p className="text-xs text-muted-foreground">Controle Financeiro</p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Action icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Eye className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Date display */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{dayOfWeek}, {dayNumber} de {monthName}</span>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{currentMonth}</span>
            <span className="text-sm text-primary font-bold">{currentYear}</span>
          </div>
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-9 h-9 bg-primary cursor-pointer hover:opacity-90 transition-opacity">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer p-2"
              onClick={() => navigate("/configuracoes")}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer p-2 text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

