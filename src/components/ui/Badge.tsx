// components/ui/Badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children }) => {
  const variantStyles = variant === "destructive" ? "bg-red-500 text-white" : "bg-green-500 text-white";
  return <span className={cn("px-2 py-1 text-xs font-bold rounded", variantStyles)}>{children}</span>;
};
