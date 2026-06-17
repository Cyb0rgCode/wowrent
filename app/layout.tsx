import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/client";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "wowRent — Rent a car in Tunisia",
  description:
    "wowRent connects car owners and rental agencies with clients across Tunisia. Browse, book and pay securely.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "wowRent",
    statusBarStyle: "default",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const locale = getLocale();
  const dict = getDictionary(locale);

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
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider locale={locale} dict={dict}>
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
        </I18nProvider>
      </body>
    </html>
  );
}
