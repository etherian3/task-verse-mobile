import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PlusCircle, BookOpen, Briefcase, Brain, Zap, User, Folder } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import UpcomingTaskCard from '@/components/UpcomingTaskCard';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2; // 2 cards per row with 16px padding on sides and middle

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks } = useTaskStore();
  const { categories, initializeDefaultCategories, addCategory } = useCategoryStore();

  useEffect(() => {
    if (categories.length === 0) {
      initializeDefaultCategories();
    }
  }, []);

  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  const handleAddCategory = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigasi ke halaman kategori baru
    router.push('/category/new');
  };

  const navigateToCategory = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/category/${id}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="TaskVerse" showProfile={true} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Categories
          </Text>
          
          <View style={styles.categoryGrid}>
            {categories.map((category, index) => (
              <CategoryCard 
                key={category.id}
                title={category.name}
                icon={category.icon}
                color={category.color}
                count={tasks.filter(task => task.categoryId === category.id && !task.completed).length}
                onPress={() => navigateToCategory(category.id)}
                style={{ width: cardWidth }}
              />
            ))}
            
            <TouchableOpacity 
              style={[
                styles.addCategoryCard, 
                { 
                  width: cardWidth, 
                  borderColor: colors.border,
                  backgroundColor: colors.cardAlt 
                }
              ]}
              onPress={handleAddCategory}
              activeOpacity={0.7}
            >
              <PlusCircle color={colors.primary} size={32} />
              <Text style={[styles.addCategoryText, { color: colors.textPrimary }]}>
                Add Category
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.upcomingSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Upcoming Deadlines
          </Text>
          
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <UpcomingTaskCard 
                key={task.id}
                task={task}
                onPress={() => router.push(`/task/${task.id}`)}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.cardAlt }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No upcoming deadlines. Add some tasks!
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.viewAllButton, { backgroundColor: colors.cardAlt }]}
            onPress={() => router.push('/tasks')}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              View All Tasks
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/task/new')}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  addCategoryCard: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCategoryText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  upcomingSection: {
    marginTop: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  viewAllButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 70,
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