'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EmotionCacheProvider from './components/EmotionCache';
import { HydrationErrorBoundary } from './components/HydrationErrorBoundary';

const theme = createTheme();

export default function Providers({ children }: { children: React.ReactNode }) {
  // Diagnostic logging for hydration debugging
  if (typeof window !== 'undefined') {
    console.log('Providers: Client-side rendering');
  } else {
    console.log('Providers: Server-side rendering');
  }

  return (
    <HydrationErrorBoundary>
      <EmotionCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </EmotionCacheProvider>
    </HydrationErrorBoundary>
  );
}