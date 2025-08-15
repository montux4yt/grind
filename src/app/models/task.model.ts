export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  category: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

 