
import { generateMetadata } from "@/utils";

export const metadata = generateMetadata("About us", "The founder of ecosave will be shown here");

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
