import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface StatsCardProps {
  title: string;
  value: string;
  color: string;
}

export default function StatsCard({ title, value, color }: StatsCardProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <Text style={[styles.value, { color: colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  colorBar: {
    height: 3,
    width: '40%',
    borderRadius: 1.5,
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});