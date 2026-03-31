import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

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
        <Header />
        <main>{children}</main>
        <footer style={{ borderTop: '1px solid #3a2f1a', marginTop: '5rem', padding: '2rem 0', textAlign: 'center' }}>
          <div className="divider" style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
            <span style={{ color: '#7a5c1a' }}>◆</span>
          </div>
          <p style={{ color: '#7a6a50', fontSize: '0.85rem', fontFamily: "'Share Tech Mono', monospace" }}>
            PilgrimHands · Under the aegis of the{" "}
            <a
              href="https://pilgrim.help"
              style={{ color: '#c9952a' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Order of Christ&apos;s Pilgrims
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
