import { useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const nativeColorScheme = useNativeColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(nativeColorScheme === 'dark' ? 'dark' : 'light');
  
  // Load saved theme from storage
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as 'light' | 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
    
    loadTheme();
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };
  
  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}