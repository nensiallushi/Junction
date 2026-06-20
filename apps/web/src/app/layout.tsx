import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mediscan — AI diagnostic imaging",
  description:
    "Clinical AI imaging for hospitals: upload, AI-assisted reads, risk-ranked worklist, and multi-doctor collaboration.",
};

export default ({ children }: PropsWithChildren) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} bg-background font-body antialiased`}>
        <ThemeProvider attribute="class">
          <div className="isolate">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
};
