import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zenncore",
  description: "A modern React UI library with Tailwind CSS support",
};

export default ({ children }: LayoutProps<"/">) => {
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
