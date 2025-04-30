import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react-native';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import TaskItem from '@/components/TaskItem';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { format } from 'date-fns';

export default function CalendarScreen() {
  const router = useRouter();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks, toggleTaskCompletion } = useTaskStore();
  const { categories } = useCategoryStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleToggleCompletion = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleTaskCompletion(id);
  };

  const handleTaskPress = (id: string) => {
    router.push(`/task/${id}`);
  };

  const handleAddTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/task/new',
      params: { defaultDate: selectedDate.toISOString() }
    });
  };
  
  // Function to get all task dates for marking in calendar
  const getMarkedDates = () => {
    const marked = {};
    tasks.forEach(task => {
      const dateStr = format(new Date(task.deadline), 'yyyy-MM-dd');
      
      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: categories.find(c => c.id === task.categoryId)?.color || colors.primary
        };
      }
    });
    return marked;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Calendar" />
      
      <View style={styles.calendarContainer}>
        <Calendar
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
          markedDates={getMarkedDates()}
          theme={theme}
        />
      </View>
      
      <View style={styles.taskListHeader}>
        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CalendarIcon size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tasks for this date
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleCompletion={() => handleToggleCompletion(item.id)}
              onPress={() => handleTaskPress(item.id)}
              categoryName={categories.find(c => c.id === item.categoryId)?.name || ''}
              categoryColor={categories.find(c => c.id === item.categoryId)?.color || '#000'}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddTask}
      >
        <PlusCircle color="#FFF" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});