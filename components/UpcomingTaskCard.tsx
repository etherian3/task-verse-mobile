import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Clock, Calendar } from 'lucide-react-native';
import { Task } from '@/types/task';
import { format, isToday, isTomorrow, isYesterday, differenceInDays } from 'date-fns';
import { useCategoryStore } from '@/store/categoryStore';

interface UpcomingTaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function UpcomingTaskCard({ task, onPress }: UpcomingTaskCardProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { categories } = useCategoryStore();
  
  const category = categories.find(cat => cat.id === task.categoryId);
  
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) {
      return 'No deadline';
    }
    
    const date = new Date(deadline);
    
    // Periksa apakah tanggal valid dan bukan default 1970
    if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
      return 'No deadline';
    }
    
    if (isToday(date)) {
      return `Today, ${format(date, 'p')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, 'p')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'p')}`;
    } else {
      return format(date, 'MMM d, p');
    }
  };
  
  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) {
      return colors.textSecondary;
    }
    
    const date = new Date(deadline);
    
    // Periksa apakah tanggal valid dan bukan default 1970
    if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
      return colors.textSecondary;
    }
    
    const now = new Date();
    const dueDate = new Date(deadline);
    const daysUntilDue = differenceInDays(dueDate, now);
    
    if (daysUntilDue < 0) return colors.error; // Overdue
    if (daysUntilDue === 0) return colors.warning; // Due today
    if (daysUntilDue <= 2) return colors.warning; // Due soon
    return colors.textSecondary; // Due later
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.categoryIndicator, 
          { backgroundColor: category?.color || colors.primary }
        ]} 
      />
      
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.deadlineContainer}>
            {task.deadline ? (
              <>
                <Clock size={12} color={getDeadlineColor(task.deadline)} />
                <Text 
                  style={[
                    styles.deadlineText, 
                    { color: getDeadlineColor(task.deadline) }
                  ]}
                >
                  {formatDeadline(task.deadline)}
                </Text>
              </>
            ) : (
              <Text 
                style={[
                  styles.deadlineText, 
                  { color: colors.textSecondary }
                ]}
              >
                No deadline
              </Text>
            )}
          </View>
          
          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
            {category?.name || 'Uncategorized'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});