import React from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Check, Clock } from 'lucide-react-native';
import { Task } from '@/types/task';
import { format, isToday, isTomorrow, isYesterday, differenceInDays } from 'date-fns';
import { useCategoryStore } from '@/store/categoryStore';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: () => void;
  onPress: () => void;
  categoryName: string;
  categoryColor: string;
}

export default function TaskItem({ 
  task, 
  onToggleCompletion, 
  onPress,
  categoryName,
  categoryColor,
}: TaskItemProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.timing(checkOpacity, {
      toValue: task.completed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [task.completed]);
  
  const handlePress = () => {
    // Tambahkan haptic feedback saat item ditekan
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };
  
  const handleToggle = () => {
    // Tambahkan haptic feedback saat checkbox ditekan
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate checkbox press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onToggleCompletion();
  };
  
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) {
      return 'No deadline';
    }
    
    const date = new Date(deadline);
    
    // Periksa apakah tanggal valid
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
  
  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return colors.error;
    if (priority === 'medium') return colors.warning;
    return colors.success;
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.card }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={handleToggle}
      >
        <Animated.View
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? 'transparent' : colors.border,
              backgroundColor: task.completed ? colors.primary : 'transparent',
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View style={{ opacity: checkOpacity }}>
            <Check size={14} color="#FFF" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.title, 
              { color: colors.textPrimary },
              task.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          <View 
            style={[
              styles.priorityTag, 
              { backgroundColor: getPriorityColor(task.priority) + '20' }
            ]}
          >
            <Text 
              style={[
                styles.priorityText, 
                { color: getPriorityColor(task.priority) }
              ]}
            >
              {task.priority.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.deadlineContainer}>
            {task.deadline ? (
              <>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                  {formatDeadline(task.deadline)}
                </Text>
              </>
            ) : (
              <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                No deadline
              </Text>
            )}
          </View>
          
          <View style={styles.categoryContainer}>
            <View 
              style={[
                styles.categoryDot, 
                { backgroundColor: categoryColor }
              ]} 
            />
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {categoryName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  priorityTag: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  footer: {
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});