import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/task';
import { useEffect } from 'react';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTaskReflection: (id: string, reflectionNote: string) => void;
  getTaskById: (id: string) => Task | null;
  clearAllTasks: () => void;
  loadTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  addTask: (taskData) => {
    const task: Task = {
      id: Date.now().toString(),
      ...taskData,
    };
    
    set((state) => {
      const newTasks = [...state.tasks, task];
      AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      return { tasks: newTasks };
    });
  },
  
  updateTask: (updatedTask) => {
    set((state) => {
      const newTasks = state.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      return { tasks: newTasks };
    });
  },
  
  deleteTask: (id) => {
    set((state) => {
      const newTasks = state.tasks.filter(task => task.id !== id);
      AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      return { tasks: newTasks };
    });
  },
  
  toggleTaskCompletion: (id) => {
    set((state) => {
      const newTasks = state.tasks.map(task => {
        if (task.id === id) {
          const completed = !task.completed;
          return {
            ...task,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return task;
      });
      AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      return { tasks: newTasks };
    });
  },
  
  updateTaskReflection: (id, reflectionNote) => {
    set((state) => {
      const newTasks = state.tasks.map(task => {
        if (task.id === id) {
          return {
            ...task,
            reflectionNote,
          };
        }
        return task;
      });
      AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      return { tasks: newTasks };
    });
  },
  
  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id) || null;
  },
  
  clearAllTasks: () => {
    AsyncStorage.removeItem('tasks');
    set({ tasks: [] });
  },
  
  loadTasks: async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        set({ tasks: JSON.parse(storedTasks) });
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  },
}));

// Initialize tasks from storage
export function useInitializeTaskStore() {
  const { loadTasks } = useTaskStore();
  
  useEffect(() => {
    loadTasks();
  }, []);
}