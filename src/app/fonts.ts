import localFont from 'next/font/local';
import { Inter, Poppins, Space_Grotesk } from 'next/font/google';

// Load Inter font from Google Fonts
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

// Load Poppins font from Google Fonts
export const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true,
});

// Load Space Grotesk font from Google Fonts for Logo
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

// Using system fonts as fallback instead of trying to load Satoshi locally
// This avoids the Google Fonts ERR_BLOCKED_BY_ORB error
export const satoshi = {
  variable: '--font-satoshi',
  style: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

// Fallback system fonts
export const systemFonts = {
  style: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};