import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Capacitaciones | Coomotor",
  description: "Sistema de formación Coca-Cola",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />
      </body>
    </html>
  );
}