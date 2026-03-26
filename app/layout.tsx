import { Inter } from "next/font/google";
import "./globals.css";
import { SnackbarProvider } from "@/lib/context/snackbar";
import queryClient from "@/lib/providers/queryProvider";
import { QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <div className='flex flex-col h-screen w-screen overflow-hidden'>
          <div className='flex flex-col items-center justify-center min-h-[75px] shrink-0 bg-[#E87722] py-2'>
            <p className='text-base font-bold text-white leading-tight'>
              Legajo Digital
            </p>
            <p className='text-xs text-white leading-tight'>
              Design, Quality and Development.
            </p>
          </div>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </QueryClientProvider>
        </div>
      </body>
    </html>
  );
}
