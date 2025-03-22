// pages/home.tsx
import { generateMetadata } from "@/utils";

export const metadata = generateMetadata("Home", "Welcome to EcoSave, the best platform for booking expire products");

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
