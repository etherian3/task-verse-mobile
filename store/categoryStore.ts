import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/types/category';
import { useEffect } from 'react';
import { BookOpen, Briefcase, Brain, Zap, User, Folder } from 'lucide-react-native';

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'college',
    name: 'College',
    icon: BookOpen,
    color: '#3D5AFE',
  },
  {
    id: 'work',
    name: 'Work',
    icon: Briefcase,
    color: '#F44336',
  },
  {
    id: 'study',
    name: 'Study',
    icon: Brain,
    color: '#00BFA5',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: Zap,
    color: '#FFC107',
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: User,
    color: '#9C27B0',
  },
];

interface CategoryState {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | null;
  initializeDefaultCategories: () => void;
  resetCategories: () => void;
  loadCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  
  addCategory: (categoryData) => {
    const category: Category = {
      id: Date.now().toString(),
      ...categoryData,
    };
    
    set((state) => {
      const newCategories = [...state.categories, category];
      AsyncStorage.setItem('categories', JSON.stringify(newCategories));
      return { categories: newCategories };
    });
  },
  
  updateCategory: (updatedCategory) => {
    set((state) => {
      const newCategories = state.categories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      );
      AsyncStorage.setItem('categories', JSON.stringify(newCategories));
      return { categories: newCategories };
    });
  },
  
  deleteCategory: (id) => {
    set((state) => {
      const newCategories = state.categories.filter(category => category.id !== id);
      AsyncStorage.setItem('categories', JSON.stringify(newCategories));
      return { categories: newCategories };
    });
  },
  
  getCategoryById: (id) => {
    return get().categories.find(category => category.id === id) || null;
  },
  
  initializeDefaultCategories: () => {
    set({ categories: DEFAULT_CATEGORIES });
    AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
  },
  
  resetCategories: () => {
    set({ categories: DEFAULT_CATEGORIES });
    AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
  },
  
  loadCategories: async () => {
    try {
      const storedCategories = await AsyncStorage.getItem('categories');
      if (storedCategories) {
        set({ categories: JSON.parse(storedCategories) });
      } else {
        // If no categories found, initialize with defaults
        set({ categories: DEFAULT_CATEGORIES });
        AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to defaults if there's an error
      set({ categories: DEFAULT_CATEGORIES });
    }
  },
}));

// Initialize categories from storage
export function useInitializeCategoryStore() {
  const { loadCategories } = useCategoryStore();
  
  useEffect(() => {
    loadCategories();
  }, []);
}