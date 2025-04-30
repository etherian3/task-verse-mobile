import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  count: number;
  onPress: () => void;
  style?: ViewStyle;
}

export default function CategoryCard({ 
  title, 
  icon: Icon, 
  color, 
  count, 
  onPress,
  style
}: CategoryCardProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: colors.card },
        style
      ]}
      onPress={onPress}
    >
      <View 
        style={[
          styles.iconContainer, 
          { backgroundColor: color + '20' }
        ]}
      >
        <Icon size={24} color={color} />
      </View>
      
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      
      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {count} {count === 1 ? 'task' : 'tasks'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  count: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});