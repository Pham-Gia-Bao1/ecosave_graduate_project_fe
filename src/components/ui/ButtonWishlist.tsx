// components/ui/Button.tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const ButtonWishlist: React.FC<ButtonProps> = ({ variant = "default", className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring";
  const variantStyles = variant === "outline" ? "border border-gray-300 bg-transparent text-gray-700" : "bg-blue-600 text-white";

  return <button className={cn(baseStyles, variantStyles, className)} {...props} />;
};