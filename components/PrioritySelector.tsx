import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Flag } from 'lucide-react-native';

interface PrioritySelectorProps {
  selectedPriority: 'low' | 'medium' | 'high';
  onSelect: (priority: 'low' | 'medium' | 'high') => void;
}

export default function PrioritySelector({
  selectedPriority,
  onSelect,
}: PrioritySelectorProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return colors.error;
    if (priority === 'medium') return colors.warning;
    return colors.success;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.priorityOption,
          { backgroundColor: selectedPriority === 'low' ? colors.success + '20' : colors.card },
          selectedPriority === 'low' && { borderColor: colors.success },
          { borderWidth: selectedPriority === 'low' ? 2 : 1, borderColor: selectedPriority === 'low' ? colors.success : colors.border }
        ]}
        onPress={() => onSelect('low')}
      >
        <Flag size={16} color={colors.success} />
        <Text 
          style={[
            styles.priorityText, 
            { color: colors.textPrimary }
          ]}
        >
          Low
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.priorityOption,
          { backgroundColor: selectedPriority === 'medium' ? colors.warning + '20' : colors.card },
          selectedPriority === 'medium' && { borderColor: colors.warning },
          { borderWidth: selectedPriority === 'medium' ? 2 : 1, borderColor: selectedPriority === 'medium' ? colors.warning : colors.border }
        ]}
        onPress={() => onSelect('medium')}
      >
        <Flag size={16} color={colors.warning} />
        <Text 
          style={[
            styles.priorityText, 
            { color: colors.textPrimary }
          ]}
        >
          Medium
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.priorityOption,
          { backgroundColor: selectedPriority === 'high' ? colors.error + '20' : colors.card },
          selectedPriority === 'high' && { borderColor: colors.error },
          { borderWidth: selectedPriority === 'high' ? 2 : 1, borderColor: selectedPriority === 'high' ? colors.error : colors.border }
        ]}
        onPress={() => onSelect('high')}
      >
        <Flag size={16} color={colors.error} />
        <Text 
          style={[
            styles.priorityText, 
            { color: colors.textPrimary }
          ]}
        >
          High
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  priorityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
});