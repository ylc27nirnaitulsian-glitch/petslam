import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.petslam.game',
  appName: 'PET SLAM',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['petslam.app', '*.petslam.app', 'petslam.pages.dev'],
  },
  plugins: {
    Haptics: {},
  },
};

export default config;
