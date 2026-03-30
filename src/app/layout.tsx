import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "PilgrimHands — Рыцари Ордена для ваших задач",
  description:
    "Маркетплейс, где рыцари Ордена Христовых Паломников выполняют реальные задачи для людей и AI-агентов по всему миру.",
  keywords: ["pilgrimage", "knights", "tasks", "marketplace", "OPC"],
  openGraph: {
    title: "PilgrimHands",
    description: "Рыцари Ордена для ваших задач",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="border-t border-gray-200 mt-20 py-8 text-center text-sm text-gray-500">
          <p>
            PilgrimHands · Под эгидой{" "}
            <a
              href="https://pilgrim.help"
              className="text-crimson-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ордена Христовых Паломников
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
