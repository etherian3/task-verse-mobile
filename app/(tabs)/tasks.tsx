import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, SortDesc, PlusCircle } from 'lucide-react-native';
import Header from '@/components/Header';
import TaskItem from '@/components/TaskItem';
import FilterModal from '@/components/FilterModal';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Task } from '@/types/task';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function TasksScreen() {
  const router = useRouter();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks, toggleTaskCompletion } = useTaskStore();
  const { categories } = useCategoryStore();
  
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categoryId: '',
    completed: null as boolean | null,
    sortBy: 'deadline' as 'deadline' | 'priority' | 'created',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  useEffect(() => {
    applyFilters();
  }, [tasks, activeFilters]);

  const applyFilters = () => {
    let result = [...tasks];
    
    // Apply category filter
    if (activeFilters.categoryId) {
      result = result.filter(task => task.categoryId === activeFilters.categoryId);
    }
    
    // Apply completion status filter
    if (activeFilters.completed !== null) {
      result = result.filter(task => task.completed === activeFilters.completed);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (activeFilters.sortBy === 'deadline') {
        return activeFilters.sortOrder === 'asc' 
          ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      
      if (activeFilters.sortBy === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return activeFilters.sortOrder === 'asc'
          ? priorityValues[a.priority] - priorityValues[b.priority]
          : priorityValues[b.priority] - priorityValues[a.priority];
      }
      
      if (activeFilters.sortBy === 'created') {
        return activeFilters.sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return 0;
    });
    
    setFilteredTasks(result);
  };

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
    router.push('/task/new');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Tasks" />
      
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.cardAlt }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={18} color={colors.textPrimary} />
          <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.cardAlt }]}
          onPress={() => {
            setActiveFilters({
              ...activeFilters,
              sortOrder: activeFilters.sortOrder === 'asc' ? 'desc' : 'asc'
            });
          }}
        >
          <SortDesc size={18} color={colors.textPrimary} />
          <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>
            {activeFilters.sortBy === 'deadline' ? 'Deadline' : 
             activeFilters.sortBy === 'priority' ? 'Priority' : 'Created'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tasks found with current filters
          </Text>
          <TouchableOpacity 
            style={[styles.addTaskButton, { backgroundColor: colors.primary }]}
            onPress={handleAddTask}
          >
            <Text style={styles.addTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
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
      
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={activeFilters}
        onFilterChange={setActiveFilters}
        categories={categories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
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
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  addTaskButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addTaskButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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