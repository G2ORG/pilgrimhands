import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { LangProvider } from "@/contexts/LangContext";
import { FooterText } from "@/components/FooterText";

export const metadata: Metadata = {
  title: "PilgrimHands — Knights of the Order for Your Tasks",
  description:
    "A marketplace where Knights of the Order of Christ's Pilgrims complete real-world tasks for people and AI agents worldwide.",
  keywords: ["pilgrimage", "knights", "tasks", "marketplace", "OPC"],
  openGraph: {
    title: "PilgrimHands",
    description: "Knights of the Order for Your Tasks",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#060402' }}>
        <LangProvider>
          <Header />
          <main style={{ paddingTop: '56px' }}>{children}</main>
          <footer style={{ borderTop: '1px solid #3a2f1a', marginTop: '5rem', padding: '2rem 0', textAlign: 'center' }}>
            <div className="divider" style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
              <span style={{ color: '#7a5c1a' }}>◆</span>
            </div>
            <FooterText />
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
