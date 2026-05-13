import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Fade Distric",
  description:
    "Donde la precisión se encuentra con el arte. Barbería premium que construye confianza, un fade a la vez. Reservá tu turno hoy.",
  keywords: ["barbería", "fade", "corte", "premium", "Buenos Aires", "barbershop", "turnos"],
  openGraph: {
    title: "Fade Distric",
    description: "Donde la precisión se encuentra con el arte. Construyendo confianza, un fade a la vez.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${syne.variable} antialiased`}
    >
      <body className="min-h-screen bg-white text-black">
        <LenisProvider>{children}</LenisProvider>
        <div className="noise-overlay" />
      </body>
    </html>
  );
}
