import { generateMetadata } from "@/utils";

export const metadata = generateMetadata("Carts", "List of products in the cart will be shown");

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
