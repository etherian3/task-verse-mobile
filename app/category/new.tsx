import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Folder, BookOpen, Briefcase, Brain, Zap, User } from 'lucide-react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCategoryStore } from '@/store/categoryStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const ICON_OPTIONS = [
  { name: 'Folder', icon: Folder },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Brain', icon: Brain },
  { name: 'Zap', icon: Zap },
  { name: 'User', icon: User },
];

const COLOR_OPTIONS = [
  '#3D5AFE', // Blue
  '#F44336', // Red
  '#00BFA5', // Teal
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#607D8B', // Blue Grey
  '#4CAF50', // Green
];

export default function NewCategoryScreen() {
  const router = useRouter();
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  const { addCategory } = useCategoryStore();
  
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  
  const handleSave = () => {
    if (name.trim() === '') {
      // Berikan haptic feedback jika nama kosong
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Tambahkan kategori baru
    addCategory({
      name: name.trim(),
      icon: selectedIcon.icon,
      color: selectedColor,
    });
    
    // Kembali ke halaman sebelumnya
    router.back();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          New Category
        </Text>
        
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: name.trim() ? colors.primary : colors.cardAlt,
              opacity: name.trim() ? 1 : 0.5,
            }
          ]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Check size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Category Name
        </Text>
        
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: colors.card,
              color: colors.textPrimary,
              borderColor: colors.border,
            }
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter category name"
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />
        
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>
          Select Icon
        </Text>
        
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((option) => {
            const isSelected = option.name === selectedIcon.name;
            
            return (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.iconOption,
                  { 
                    backgroundColor: isSelected ? selectedColor + '20' : colors.card,
                    borderColor: isSelected ? selectedColor : colors.border,
                  }
                ]}
                onPress={() => setSelectedIcon(option)}
              >
                <option.icon 
                  size={24} 
                  color={isSelected ? selectedColor : colors.textSecondary} 
                />
              </TouchableOpacity>
            );
          })}
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>
          Select Color
        </Text>
        
        <View style={styles.colorGrid}>
          {COLOR_OPTIONS.map((color) => {
            const isSelected = color === selectedColor;
            
            return (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { 
                    backgroundColor: color,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: colors.background,
                    transform: [{ scale: isSelected ? 1.2 : 1 }],
                  }
                ]}
                onPress={() => setSelectedColor(color)}
              />
            );
          })}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },
}); 