import { generateMetadata } from "@/utils";

export const metadata = generateMetadata("Wishlist", "Log in to your account on LayRestaurant");

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
