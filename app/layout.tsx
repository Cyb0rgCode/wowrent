import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "wowRent — Rent a car in Tunisia",
  description:
    "wowRent connects car owners and rental agencies with clients across Tunisia. Browse, book and pay securely.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  let unreadCount = 0;
  if (user) {
    unreadCount = await prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: {
          OR: [{ clientId: user.id }, { supplierId: user.id }],
        },
      },
    });
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Navbar
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  isSupplier: Boolean(user.supplierProfile),
                }
              : null
          }
          unreadCount={unreadCount}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
