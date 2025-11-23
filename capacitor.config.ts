import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.db024d82319f432c9f61d1cbf4a1bf2e',
  appName: 'HACHEF SCHÉMA ÉLECTRIQUE AI PRO',
  webDir: 'dist',
  server: {
    url: 'https://db024d82-319f-432c-9f61-d1cbf4a1bf2e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
