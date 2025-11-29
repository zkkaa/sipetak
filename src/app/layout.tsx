// File: src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext'; // ✅ NEW

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "sipetak",
  description: "Sistem Informasi Penataan dan Penertiban Pedagang Kaki Lima dan Usaha Mikro di Kota Tasikmalaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`snap-y snap-mandatory ${poppins.className} min-h-screen bg-gray-50`}
      >
        <UserProvider>
          <NotificationProvider>  {/* ✅ NEW: Wrap with NotificationProvider */}
            {children}
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}