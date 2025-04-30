import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Theme } from '@/constants/colors';
// import useNotifications from '@/hooks/useNotifications';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  
  // Notifikasi dimatikan sementara karena error
  // useNotifications();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Sembunyikan splash screen setelah font dimuat atau jika ada error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Menampilkan null saat font belum dimuat untuk mencegah flash konten
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack 
        initialRouteName="(tabs)"
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            title: 'Oops!',
            presentation: 'modal',
          }} 
        />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}