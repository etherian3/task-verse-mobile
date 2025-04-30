import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Task } from '@/types/task';
import { Check, ArrowLeft, Clock, Calendar, Flag, Edit2, X, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { format } from 'date-fns';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks, getTaskById, toggleTaskCompletion, deleteTask, updateTaskReflection } = useTaskStore();
  const { categories } = useCategoryStore();
  
  const [task, setTask] = useState<Task | null>(null);
  const [reflectionNote, setReflectionNote] = useState('');
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  
  useEffect(() => {
    if (id) {
      const taskData = getTaskById(id as string);
      setTask(taskData);
      
      if (taskData?.reflectionNote) {
        setReflectionNote(taskData.reflectionNote);
      }
    }
  }, [id, tasks]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleEdit = () => {
    if (task) {
      router.push(`/task/edit/${task.id}`);
    }
  };
  
  const handleToggleCompletion = () => {
    if (task) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      if (!task.completed) {
        setIsEditingReflection(true);
      } else {
        toggleTaskCompletion(task.id);
      }
    }
  };
  
  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (task) {
              deleteTask(task.id);
              router.back();
            }
          },
        },
      ]
    );
  };
  
  const handleSaveReflection = () => {
    if (task) {
      updateTaskReflection(task.id, reflectionNote);
      toggleTaskCompletion(task.id);
      setIsEditingReflection(false);
    }
  };
  
  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return colors.error;
    if (priority === 'medium') return colors.warning;
    return colors.success;
  };
  
  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>Task not found</Text>
      </SafeAreaView>
    );
  }
  
  const category = categories.find(c => c.id === task.categoryId);

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
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.cardAlt }]}
            onPress={handleEdit}
          >
            <Edit2 size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleDeleteTask}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              style={[
                styles.checkboxContainer,
                task.completed ? { backgroundColor: colors.primary } : { borderColor: colors.border }
              ]}
              onPress={handleToggleCompletion}
            >
              {task.completed && <Check size={18} color="#FFF" />}
            </TouchableOpacity>
            
            <Text 
              style={[
                styles.taskTitle, 
                { color: colors.textPrimary },
                task.completed && styles.completedText
              ]}
            >
              {task.title}
            </Text>
          </View>
          
          <View style={styles.categoryTag}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: category?.color || colors.primary }
              ]}
            />
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {category?.name || 'Uncategorized'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Calendar size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              {format(new Date(task.deadline), 'PPP')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              {format(new Date(task.deadline), 'p')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Flag size={18} color={getPriorityColor(task.priority)} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Text>
          </View>
          
          {task.courseName && (
            <View style={styles.infoRow}>
              <View style={[styles.courseDot, { backgroundColor: category?.color || colors.primary }]} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                {task.courseName}
                {task.assignmentType ? ` - ${task.assignmentType}` : ''}
              </Text>
            </View>
          )}
        </View>
        
        {task.description ? (
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Description
            </Text>
            <View style={[styles.descriptionContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>
                {task.description}
              </Text>
            </View>
          </View>
        ) : null}
        
        {task.completed && task.reflectionNote ? (
          <View style={styles.reflectionSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Reflection Notes
            </Text>
            <View style={[styles.reflectionContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.reflectionText, { color: colors.textPrimary }]}>
                {task.reflectionNote}
              </Text>
              <Text style={[styles.completedAtText, { color: colors.textSecondary }]}>
                Completed on {format(new Date(task.completedAt || new Date()), 'PPp')}
              </Text>
            </View>
          </View>
        ) : null}
        
        {!task.completed && (
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={handleToggleCompletion}
          >
            <Check size={20} color="#FFF" />
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {isEditingReflection && (
        <View style={[styles.reflectionModal, { backgroundColor: colors.background }]}>
          <View style={styles.reflectionModalHeader}>
            <Text style={[styles.reflectionModalTitle, { color: colors.textPrimary }]}>
              Add Reflection Note
            </Text>
            <TouchableOpacity onPress={() => setIsEditingReflection(false)}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.reflectionPrompt, { color: colors.textSecondary }]}>
            How was your experience completing this task?
          </Text>
          
          <TextInput
            style={[
              styles.reflectionInput, 
              { 
                backgroundColor: colors.card,
                color: colors.textPrimary,
                borderColor: colors.border,
              }
            ]}
            value={reflectionNote}
            onChangeText={setReflectionNote}
            placeholder="I learned that..."
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            numberOfLines={5}
          />
          
          <TouchableOpacity 
            style={[styles.saveReflectionButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveReflection}
          >
            <Text style={styles.saveReflectionButtonText}>Complete Task</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  courseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
    marginRight: 14,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  descriptionContainer: {
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  reflectionSection: {
    marginBottom: 24,
  },
  reflectionContainer: {
    padding: 16,
    borderRadius: 12,
  },
  reflectionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  completedAtText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  reflectionModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  reflectionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reflectionModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  reflectionPrompt: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  reflectionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 120,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  saveReflectionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveReflectionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});