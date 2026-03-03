import type { Metadata } from "next";
import { Outfit, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Moments RedNote - AI Content Studio",
  description: "AI-Powered Social Media Content Generator for WeChat and RedNote",
};

interface RootLayoutProps {
  children: React.ReactNode;
}
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body className={`${outfit.variable} ${playfairDisplay.variable} ${dmSans.variable} antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
