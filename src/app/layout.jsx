import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './navbar/page';
import DynamicBreadcrumb from './breadcrumb/page';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Meowtrade",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <Navbar />
          <main className="container mx-auto mt-4">
            <DynamicBreadcrumb />
            {children}
          </main>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}