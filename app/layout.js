
import "./globals.css";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import GlobalStickerLayer from "../components/playground/GlobalStickerLayer";

export const metadata = {
  title: {
    default: "Sticker Studio",
    template: "%s | Sticker Studio",
  },
  description:
    "Your own little creative playground for making, collecting and designing stickers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body className="flex min-h-screen flex-col antialiased">
        <GlobalStickerLayer>
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </GlobalStickerLayer>
      </body>
    </html>
  );
}
