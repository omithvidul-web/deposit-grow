import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.depositcalc',
  appName: 'Deposit Calculator',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
