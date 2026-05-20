import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata = {
  title: 'FundScope — Institutional-Grade Mutual Fund Screener',
  description:
    'Advanced portfolio analytics, XIRR tracking, risk-return analysis and AI-powered fund recommendations for Indian mutual funds.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
