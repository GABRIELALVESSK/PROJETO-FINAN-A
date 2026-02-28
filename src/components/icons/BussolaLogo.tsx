import { cn } from "@/lib/utils";

interface BussolaLogoProps {
  className?: string;
}

export function BussolaLogo({ className }: BussolaLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 6 L20 14 M20 26 L20 34 M6 20 L14 20 M26 20 L34 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="20"
        cy="20"
        r="4"
        fill="currentColor"
      />
      <path
        d="M20 8 L22 16 L20 20 L18 16 Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}
