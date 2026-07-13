import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Cinzel } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dar Al Halal Certification | Global Halal Certification, Made Accessible",
    template: "%s | Dar Al Halal Certification",
  },
  description:
    "Global halal certification, made accessible. Get certified to access the $3 trillion global halal economy. Serving food, cosmetics, pharmaceuticals and more.",
  keywords: ["halal certification", "Nigeria", "halal certification authority", "food certification", "Africa halal"],
  authors: [{ name: "Dar Al Halal Certification" }],
  creator: "Dar Al Halal Certification",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://daralhalalcertification.com",
    siteName: "Dar Al Halal Certification",
    title: "Dar Al Halal Certification | Global Halal Certification, Made Accessible",
    description:
      "Nigeria's gateway to the $3 trillion global halal economy. Certified halal products trusted across Africa and global halal markets.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dar Al Halal Certification",
    description: "Global Halal Certification, Made Accessible",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable} ${cinzel.variable}`}>
        {children}
      </body>
    </html>
  );
}
