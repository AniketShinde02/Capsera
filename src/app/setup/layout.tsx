import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';

export default function SetupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      {children}
      <Toaster />
    </Providers>
  );
}
