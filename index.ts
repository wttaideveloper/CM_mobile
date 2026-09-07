import * as ExpoSplashScreen from 'expo-splash-screen';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

require('expo-router/entry');
