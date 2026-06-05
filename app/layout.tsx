import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GKLI Core",
  description: "Base central de usuários, acessos, apps e carteiras da Gekali"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
