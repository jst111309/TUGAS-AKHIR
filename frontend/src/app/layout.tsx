import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CIC SecureWatch — Security Monitoring Dashboard',
  description: 'Sistem Monitoring dan Analisis Log Keamanan (SIEM) berbasis web oleh PT. Cipta Informatika Cemerlang.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
