import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Code Share",
  description: "Code sharing app",
};

type Props = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
