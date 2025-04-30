export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string | null; // ISO date string atau null jika tidak ada deadline
  completed: boolean;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  reflectionNote?: string;
  courseName?: string; // For college tasks
  assignmentType?: string; // For college tasks
}