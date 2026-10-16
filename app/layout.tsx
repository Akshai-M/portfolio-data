import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-pulse-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-pulse-display",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-pulse-serif",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-pulse-mono",
});

export const metadata: Metadata = {
  title: "Portfolio export viewer",
  description: "Local viewer for Livefolio portfolio export data",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0a0a] font-sans text-slate-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
