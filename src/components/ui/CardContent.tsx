import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export const CardContent = ({ className, children }: CardProps) => {
  return (
    <div className={cn("rounded-lg border bg-white shadow-sm p-4", className)}>
      {children}
    </div>
  );
};
