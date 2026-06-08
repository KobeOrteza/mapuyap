import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAPUYAP | Anonymous Student Chat",
  description:
    "Meet and chat anonymously with fellow Mapúa students. Connect instantly, make new friends, and join real-time campus conversations.",

  keywords: [
    "MAPUYAP",
    "Mapúa",
    "Mapua University",
    "Anonymous Chat",
    "Student Chat",
    "College Chat",
    "Mapua Students",
    "Anonymous Messaging",
    "Campus Chat",
    "Real-time Chat",
  ],

  openGraph: {
    title: "MAPUYAP | Anonymous Student Chat",
    description:
      "Connect anonymously with fellow Mapúa students in real time.",
    url: "https://mapuyap.site",
    siteName: "MAPUYAP",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "MAPUYAP Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MAPUYAP | Anonymous Student Chat",
    description:
      "Connect anonymously with fellow Mapúa students in real time.",
    images: ["/logo.png"],
  },

  metadataBase: new URL("https://mapuyap.site"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}