import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundScreen() {
  const { theme } = useColorScheme();
  const colors = Theme[theme];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>
          This screen doesn't exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: colors.primary }}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});