import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { useCategoryStore } from '@/store/categoryStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import CategorySelector from '@/components/CategorySelector';
import PrioritySelector from '@/components/PrioritySelector';
import { Task } from '@/types/task';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { tasks, getTaskById, updateTask } = useTaskStore();
  const { categories } = useCategoryStore();
  
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState(new Date());
  const [courseName, setCourseName] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  useEffect(() => {
    if (id) {
      const taskData = getTaskById(id as string);
      setTask(taskData);
      
      if (taskData) {
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setCategoryId(taskData.categoryId);
        setPriority(taskData.priority);
        setDeadline(new Date(taskData.deadline));
        setCourseName(taskData.courseName || '');
        setAssignmentType(taskData.assignmentType || '');
      }
    }
  }, [id]);
  
  const isCollegeCategory = categories.find(cat => cat.id === categoryId)?.name.toLowerCase() === 'college' || 
                             categories.find(cat => cat.id === categoryId)?.name.toLowerCase() === 'kuliah';
  
  const handleBack = () => {
    router.back();
  };
  
  const onDateChange = (event, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      const currentTime = deadline;
      selectedDate.setHours(currentTime.getHours());
      selectedDate.setMinutes(currentTime.getMinutes());
      setDeadline(selectedDate);
    }
  };
  
  const onTimeChange = (event, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDeadline(newDate);
    }
  };
  
  const handleUpdateTask = () => {
    if (!title.trim() || !task) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    const updatedTask: Task = {
      ...task,
      title,
      description,
      categoryId,
      priority,
      deadline: deadline.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (isCollegeCategory) {
      updatedTask.courseName = courseName;
      updatedTask.assignmentType = assignmentType;
    } else {
      // Remove college-specific fields if category is not college
      delete updatedTask.courseName;
      delete updatedTask.assignmentType;
    }
    
    updateTask(updatedTask);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.back();
  };
  
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>Task not found</Text>
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Edit Task
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Task Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea, 
              { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description (optional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
          <CategorySelector
            categories={categories}
            selectedCategoryId={categoryId}
            onSelect={setCategoryId}
          />
        </View>
        
        {isCollegeCategory && (
          <>
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Course Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
                value={courseName}
                onChangeText={setCourseName}
                placeholder="e.g. Web Programming"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Assignment Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
                value={assignmentType}
                onChangeText={setAssignmentType}
                placeholder="e.g. Homework 1, Project, Exam"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </>
        )}
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Priority</Text>
          <PrioritySelector
            selectedPriority={priority}
            onSelect={setPriority}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Deadline</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={[styles.dateTimeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <CalendarIcon size={18} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.textPrimary }]}>
                {formatDate(deadline)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateTimeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={18} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.textPrimary }]}>
                {formatTime(deadline)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        
        {showTimePicker && (
          <DateTimePicker
            value={deadline}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
        
        <TouchableOpacity 
          style={[styles.updateButton, { backgroundColor: colors.primary }]}
          onPress={handleUpdateTask}
        >
          <Text style={styles.updateButtonText}>Update Task</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dateTimeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  updateButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  updateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});