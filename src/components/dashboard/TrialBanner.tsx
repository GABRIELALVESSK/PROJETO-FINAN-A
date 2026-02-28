import { Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  daysLeft: number;
  hoursLeft: number;
  expired?: boolean;
  onDismiss?: () => void;
}

export function TrialBanner({ daysLeft, hoursLeft, expired = true, onDismiss }: TrialBannerProps) {
  if (expired) {
    return (
      <div className="bg-[#FFF9F2] rounded-xl border border-[#FFE4CC] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-950">Seu período de teste expirou</span>
            </div>
            <p className="text-sm text-orange-800/80">
              Você está em modo de visualização. Assine para adicionar ou editar transações.
            </p>
          </div>
        </div>
        <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white font-medium px-6">
          Assinar Agora
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Você está no período de teste gratuito</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Restam <span className="text-primary font-medium">{daysLeft} dias e {hoursLeft}h</span> para aproveitar todos os recursos.
          </p>
        </div>
      </div>
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium">
        <Sparkles className="w-4 h-4" />
        Garantir Acesso
      </Button>
    </div>
  );
}
