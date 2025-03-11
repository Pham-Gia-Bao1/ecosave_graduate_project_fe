import { generateMetadata } from "@/utils";
export const metadata = generateMetadata("inputRawData", "Scan the Barcode Information");
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
