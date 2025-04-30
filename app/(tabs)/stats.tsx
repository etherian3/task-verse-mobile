import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';

export default function StatsScreen() {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks } = useTaskStore();
  const { categories } = useCategoryStore();
  const [timeRange, setTimeRange] = useState('week');
  
  const screenWidth = Dimensions.get('window').width - 40;
  
  // Calculate completion rate
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Tasks by category data
  const tasksByCategory = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.categoryId === category.id);
    return {
      name: category.name,
      count: categoryTasks.length,
      color: category.color,
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    };
  }).filter(item => item.count > 0);
  
  // No tasks data for pie chart
  const noTasksData = [
    {
      name: 'No Data',
      count: 1,
      color: colors.textSecondary,
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    }
  ];
  
  // Calculate task completion data for line chart
  const getCompletionData = () => {
    const today = new Date();
    let startDate, endDate;
    
    if (timeRange === 'week') {
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
    } else {
      startDate = startOfWeek(addWeeks(today, -3));
      endDate = endOfWeek(today);
    }
    
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    const labels = daysInterval.map(date => format(date, 'dd/MM'));
    
    const completedPerDay = daysInterval.map(date => {
      const completedCount = tasks.filter(task => {
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;
        if (!completedDate) return false;
        
        return (
          completedDate.getDate() === date.getDate() &&
          completedDate.getMonth() === date.getMonth() &&
          completedDate.getFullYear() === date.getFullYear()
        );
      }).length;
      
      return completedCount;
    });
    
    return {
      labels: timeRange === 'week' ? labels : labels.filter((_, i) => i % 7 === 0),
      datasets: [{
        data: timeRange === 'week' ? completedPerDay : completedPerDay.filter((_, i) => i % 7 === 0),
        color: () => colors.primary,
        strokeWidth: 2
      }]
    };
  };
  
  const completionData = getCompletionData();
  
  // Calculate current streak
  const calculateStreak = () => {
    const sortedCompletedTasks = tasks
      .filter(task => task.completed && task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
    if (sortedCompletedTasks.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedCompletedTasks[0].completedAt!);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the most recent completion was today or yesterday
    if (currentDate.getDate() !== new Date().getDate() && 
        currentDate.getDate() !== yesterday.getDate()) {
      return 0;
    }
    
    for (let i = 1; i < sortedCompletedTasks.length; i++) {
      const prevDate = new Date(sortedCompletedTasks[i].completedAt!);
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const streak = calculateStreak();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Statistics" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statsCards}>
          <StatsCard 
            title="Completion Rate"
            value={`${completionRate}%`}
            color={colors.success}
          />
          <StatsCard 
            title="Tasks Completed"
            value={completedTasks.toString()}
            color={colors.primary}
          />
          <StatsCard 
            title="Current Streak"
            value={streak.toString()}
            color={colors.accent}
          />
        </View>
        
        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Tasks by Category
          </Text>
          
          {tasks.length > 0 ? (
            <PieChart
              data={tasksByCategory.length > 0 ? tasksByCategory : noTasksData}
              width={screenWidth}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => colors.textPrimary,
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={[styles.noDataContainer, { borderColor: colors.border }]}>
              <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                No data available. Add some tasks!
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Completion Trend
            </Text>
            
            <View style={styles.timeRangeButtons}>
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  timeRange === 'week' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTimeRange('week')}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    timeRange === 'week' ? styles.activeTimeText : { color: colors.textPrimary }
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  timeRange === 'month' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTimeRange('month')}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    timeRange === 'month' ? styles.activeTimeText : { color: colors.textPrimary }
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {tasks.some(task => task.completed) ? (
            <LineChart
              data={completionData}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(61, 90, 254, ${opacity})`,
                labelColor: (opacity = 1) => colors.textPrimary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
              }}
              style={styles.chartStyle}
              bezier
            />
          ) : (
            <View style={[styles.noDataContainer, { borderColor: colors.border }]}>
              <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                Complete some tasks to see your productivity trend!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRangeButtons: {
    flexDirection: 'row',
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  timeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  activeTimeText: {
    color: '#FFFFFF',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});