import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskCategory } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly TASKS_KEY = 'grind_tasks';
  private readonly LAST_RESET_KEY = 'grind_last_reset';
  private readonly CATEGORIES_KEY = 'grind_categories';
  private readonly SUPPRESS_DEFAULTS_KEY = 'grind_suppress_defaults';

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private categoriesSubject = new BehaviorSubject<TaskCategory[]>([]);
  private activeCategory = new BehaviorSubject<string>('general');

  public tasks$ = this.tasksSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public activeCategory$ = this.activeCategory.asObservable();

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    this.initializeDefaultCategories();
    this.checkAndPerformDailyReset();
    this.loadTasks();
    this.loadCategories();
  }

  private initializeDefaultCategories(): void {
    return;
  }

  private checkAndPerformDailyReset(): void {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem(this.LAST_RESET_KEY);

    // If there is no last reset recorded, initialize it without resetting
    if (!lastReset) {
      localStorage.setItem(this.LAST_RESET_KEY, today);
      return;
    }

    if (lastReset !== today) {
      this.performDailyReset();
      localStorage.setItem(this.LAST_RESET_KEY, today);
    }
  }

  private performDailyReset(): void {
    const tasks = this.getTasksFromStorage();

    const resetTasks = tasks.map(task => ({
      ...task,
      completed: false,
      completedAt: undefined,
      // Keep category as-is; do not default
      category: String(task.category || '').toLowerCase()
    }));

    this.saveTasksToStorage(resetTasks);
  }

  private loadTasks(): void {
    const tasks = this.getTasksFromStorage();
    this.tasksSubject.next(tasks);
  }

  private loadCategories(): void {
    const categories = this.getCategoriesFromStorage();
    this.categoriesSubject.next(categories);
    const currentActive = this.activeCategory.value;
    if (categories.length > 0 && (!currentActive || !categories.some(c => c.name === currentActive))) {
      this.setActiveCategory(categories[0].name);
    }
  }

  private getTasksFromStorage(): Task[] {
    const tasksData = localStorage.getItem(this.TASKS_KEY);
    if (tasksData) {
      return JSON.parse(tasksData).map((task: any) => ({
        ...task,
        category: String(task.category || '').toLowerCase(),
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
    }
    return [];
  }

  private getCategoriesFromStorage(): TaskCategory[] {
    const categoriesData = localStorage.getItem(this.CATEGORIES_KEY);
    if (categoriesData) {
      return JSON.parse(categoriesData).map((category: any) => ({
        ...category,
        name: String(category.name).toLowerCase(),
        createdAt: new Date(category.createdAt)
      }));
    }
    return [];
  }

  private saveCategoriestoStorage(categories: TaskCategory[]): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    this.categoriesSubject.next(categories);
  }

  private saveTasksToStorage(tasks: Task[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }

  addTask(title: string, categoryName?: string): void {
    const tasks = this.getTasksFromStorage();
    const newTask: Task = {
      id: this.generateId(),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      category: (categoryName || this.activeCategory.value).toLowerCase()
    };

    tasks.push(newTask);
    this.saveTasksToStorage(tasks);
  }

  updateTask(taskId: string, updates: Partial<Task>): void {
    const tasks = this.getTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
      const nextTask = { ...tasks[taskIndex], ...updates } as Task;
      if (updates.completed !== undefined) {
        nextTask.completedAt = updates.completed ? new Date() : undefined;
      }
      if (updates.category) {
        nextTask.category = String(updates.category).toLowerCase();
      }
      tasks[taskIndex] = nextTask;
      this.saveTasksToStorage(tasks);
    }
  }

  deleteTask(taskId: string): void {
    const tasks = this.getTasksFromStorage();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    this.saveTasksToStorage(filteredTasks);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  addCategory(name: string, color: string): void {
    const categories = this.getCategoriesFromStorage();
    const wasEmpty = categories.length === 0;
    const newCategory: TaskCategory = {
      id: this.generateId(),
      name: name.trim().toLowerCase(),
      color,
      createdAt: new Date()
    };

    categories.push(newCategory);
    this.saveCategoriestoStorage(categories);

    if (wasEmpty) {
      this.setActiveCategory(newCategory.name);
    }
  }

  renameCategory(oldName: string, newName: string): void {
    const normalizedOld = oldName.toLowerCase();
    const normalizedNew = newName.toLowerCase();

    const categories = this.getCategoriesFromStorage();
    const targetExists = categories.some(c => c.name === normalizedNew);

    let nextCategories: TaskCategory[];
    if (targetExists) {
      nextCategories = categories.filter(c => c.name !== normalizedOld);
    } else {
      nextCategories = categories.map(category =>
        category.name === normalizedOld ? { ...category, name: normalizedNew } : category
      );
    }
    this.saveCategoriestoStorage(nextCategories);

    const tasks = this.getTasksFromStorage();
    const remappedTasks = tasks.map(task =>
      task.category === normalizedOld ? { ...task, category: normalizedNew } : task
    );
    this.saveTasksToStorage(remappedTasks);

    if (this.activeCategory.value === normalizedOld) {
      this.setActiveCategory(normalizedNew);
    }
  }

  deleteCategory(categoryName: string): void {
    const normalized = categoryName.toLowerCase();

    const categories = this.getCategoriesFromStorage();
    const filteredCategories = categories.filter(c => c.name !== normalized);

    // Delete tasks that belong to the removed category
    const tasks = this.getTasksFromStorage();
    const remainingTasks = tasks.filter(task => task.category !== normalized);

    this.saveTasksToStorage(remainingTasks);
    this.saveCategoriestoStorage(filteredCategories);

    if (this.activeCategory.value === normalized) {
      const nextActive = filteredCategories.length > 0 ? filteredCategories[0].name : '';
      this.setActiveCategory(nextActive);
    }
  }

  setActiveCategory(categoryName: string): void {
    this.activeCategory.next((categoryName || '').toLowerCase());
  }

  getTasksByCategory(categoryName: string): Task[] {
    const name = categoryName.toLowerCase();
    return this.getTasksFromStorage().filter(task => task.category === name);
  }

  public reloadTasksFromStorage(): void { this.loadTasks(); }
  public reloadCategoriesFromStorage(): void { this.loadCategories(); }
} 