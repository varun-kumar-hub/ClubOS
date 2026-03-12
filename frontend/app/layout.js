import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/shared/Navbar';
import './globals.css';
import { Outfit, Inter } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Club Event Platform',
  description: 'Manage college club events, teams, and participants centrally',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${outfit.variable} ${inter.variable} font-sans min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="app-shell py-8 sm:py-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
