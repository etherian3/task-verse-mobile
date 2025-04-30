import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PlusCircle, Edit2 } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import Header from '@/components/Header';
import TaskItem from '@/components/TaskItem';
import { Category } from '@/types/category';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks, toggleTaskCompletion } = useTaskStore();
  const { categories, getCategoryById } = useCategoryStore();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryTasks, setCategoryTasks] = useState([]);
  
  useEffect(() => {
    if (id) {
      const categoryData = getCategoryById(id as string);
      setCategory(categoryData);
    }
  }, [id, categories]);
  
  useEffect(() => {
    if (category) {
      const filteredTasks = tasks.filter(task => task.categoryId === category.id);
      setCategoryTasks(filteredTasks);
    }
  }, [category, tasks]);
  
  const handleBack = () => {
    router.back();
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
    
    if (category) {
      router.push({
        pathname: '/task/new',
        params: { defaultCategory: category.id }
      });
    } else {
      router.push('/task/new');
    }
  };
  
  const handleEditCategory = () => {
    if (category) {
      router.push(`/category/edit/${category.id}`);
    }
  };
  
  if (!category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>Category not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.cardAlt }]}
          onPress={handleBack}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <View 
            style={[
              styles.categoryDot, 
              { backgroundColor: category.color }
            ]} 
          />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {category.name}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: colors.cardAlt }]}
          onPress={handleEditCategory}
        >
          <Edit2 size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {categoryTasks.filter(task => !task.completed).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {categoryTasks.filter(task => task.completed).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {categoryTasks.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
        </View>
      </View>
      
      <View style={styles.tasksHeaderContainer}>
        <Text style={[styles.tasksHeader, { color: colors.textPrimary }]}>
          Tasks
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      
      {categoryTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tasks in this category
          </Text>
          <TouchableOpacity 
            style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
            onPress={handleAddTask}
          >
            <Text style={styles.emptyAddButtonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categoryTasks}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleCompletion={() => handleToggleCompletion(item.id)}
              onPress={() => handleTaskPress(item.id)}
              categoryName={category.name}
              categoryColor={category.color}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  statCard: {
    width: '30%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  tasksHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tasksHeader: {
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
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyAddButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
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