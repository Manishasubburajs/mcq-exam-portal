import Providers from './providers';
import SessionManager from '../components/SessionManager';
import "./globals.css";
import { Metadata } from 'next';

export const metadata : Metadata = {
  title: "Login App",
  description: "Login and Registration App",
};
export const viewport = 'width=device-width, initial-scale=1';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <Providers>
          <SessionManager>
            {children}
          </SessionManager>
        </Providers>
      </body>
    </html>
  );
}
