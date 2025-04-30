import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showProfile?: boolean;
}

export default function Header({ title, showProfile = false }: HeaderProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      
      {showProfile && (
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.cardAlt }]}
        >
          <User size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});