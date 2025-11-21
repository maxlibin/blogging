import React from 'react';
import './globals.css';
import { WordPressProvider } from '../contexts/WordPressContext';

export const metadata = {
  title: 'AiWriter',
  description: 'AI Writing Assistant',
};

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>

          <WordPressProvider>
            {children}
          </WordPressProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}