import "./reset.css";
import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medicare Dashboard",
  description: "Administrative dashboard for Medicare services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={`${inter.className} bg-white text-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
