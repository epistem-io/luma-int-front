import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { MapContextContainer } from "@/contexts/mapContext";
import { GlobalContextContainer } from "@/contexts/globalContext";
import { AuthContextContainer } from "@/contexts/authContext";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/Analytics";
import { MapGenerationContextContainer } from "@/contexts/mapGenerationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const inter = localFont({
  src: "../../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  display: "swap",
});

const notoSans = localFont({
  src: "../../../public/fonts/NotoSans-VariableFont_wdth,wght.ttf",
  variable: "--font-noto-sans",
  display: "swap",
});

const pjs = Plus_Jakarta_Sans({
  variable: "--font-pjs",
  subsets: ["latin"],
});

const lato = localFont({
  src: [
    {
      path: "../../../public/fonts/Lato-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Lato-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Lato-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Lato-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Lato-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-lato",
});

const degularDisplayDemo = localFont({
  src: [
    {
      path: "../../../public/fonts/DegularDisplayDemo-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-degular-display-demo",
});

const aptos = localFont({
  src: [
    {
      path: "../../../public/fonts/Aptos-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Aptos.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Aptos-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Aptos-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Aptos-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Aptos-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Aptos-Light-Italic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../../public/fonts/Aptos-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../public/fonts/Aptos-SemiBold-Italic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../../public/fonts/Aptos-Bold-Italic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../../public/fonts/Aptos-ExtraBold-Italic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../../public/fonts/Aptos-Black-Italic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-aptos",
});

const acumin = localFont({
  src: [
    {
      path: "../../../public/fonts/AcuminPro-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Light.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Thin.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-Black.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../../public/fonts/AcuminPro-UltraBlack.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-acumin",
});

export const metadata: Metadata = {
  title: "EPISTEM",
  description:
    "Bersama Membangun Sistem Digital untuk Solusi Alami Perubahan Iklim",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lato.variable} ${notoSans.variable} ${aptos.variable} ${acumin.variable} ${roboto.variable} ${pjs.variable} ${degularDisplayDemo.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <AuthContextContainer>
            <GlobalContextContainer>
              <MapContextContainer>
                <MapGenerationContextContainer>
                  <div className="relative">
                    <NavBar />
                    {children}
                    <Toaster />
                    <Analytics />
                  </div>
                </MapGenerationContextContainer>
              </MapContextContainer>
            </GlobalContextContainer>
          </AuthContextContainer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
