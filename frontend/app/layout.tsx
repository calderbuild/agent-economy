import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentEconomy",
  description: "AI Agent Micro-Economy on Kite Chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen ambient-glow">{children}</body>
    </html>
  );
}
