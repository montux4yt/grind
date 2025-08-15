import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { TaskService } from '../../services/task.service';
import { Task, TaskCategory } from '../../models/task.model';
import { RadialMenuComponent, RadialMenuEvent } from '../radial-menu/radial-menu.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RadialMenuComponent
  ],
    template: `
    <div class="task-list-container">
      <!-- Header Box -->
      <div class="box" style="margin-top: 10px;">
        <div class="box-label">BOX 1: DATE</div>
        <header class="app-header">
          <p class="date" (click)="toggleInputBox()">{{ currentDate }}</p>
        </header>
      </div>

      <!-- Input Box - Hidden by default -->
      <div class="box" *ngIf="showInputBox">
        <div class="box-label">INPUT</div>
        <div class="add-task-section">
          <mat-form-field appearance="outline" class="task-input">
            <input matInput 
                   #taskInput
                   [(ngModel)]="newTaskTitle"
                   (keydown.enter)="handleInput()"
                   (keydown.escape)="hideInputBox()"
                   placeholder="ADD TASK">
          </mat-form-field>
          <button mat-raised-button 
                  color="primary" 
                  class="add-button"
                  [class.error]="hasCommandError"
                  (click)="handleInput()"
                  [disabled]="!newTaskTitle.trim()">
            +
          </button>
        </div>
      </div>

      <!-- Category Tabs & Tasks Box -->
      <div class="box">
        <div class="box-label">BOX 2: TASKS</div>

        <!-- Show NO CATEGORY when there are no categories -->
        <ng-container *ngIf="categories.length === 0; else categoryArea">
          <div class="no-category-message">NO CATEGORY</div>
        </ng-container>

        <ng-template #categoryArea>
          <!-- Category Tabs - Karui Style -->
          <div class="category-tabs-karui">
            <span *ngFor="let category of categories"
                  [class]="activeCategory === category.name ? 'active-tab' : 'inactive-tab'"
                  (click)="setActiveCategory(category.name)">
              {{ category.name }}
            </span>
          </div>

          <!-- Tasks List -->
          <div class="task-list" *ngIf="tasks.length > 0; else emptyState">
            <div class="task-item" 
                 *ngFor="let task of tasks; trackBy: trackByTaskId"
                 [class.completed]="task.completed"
                 (pointerdown)="onTaskPointerDown($event, task)"
                 (touchstart)="onTaskTouchStart($event, task)"
                 (contextmenu)="onTaskContextMenu($event, task)">
             
             <span class="task-dot"></span>
             <span class="task-content">
               <span class="task-title" 
                     [class.editing]="editingTask?.id === task.id"
                     *ngIf="editingTask?.id !== task.id">
                 {{ task.title }}
               </span>
               
               <input *ngIf="editingTask?.id === task.id"
                      class="task-edit-input"
                      [(ngModel)]="editTaskTitle"
                      (keydown.enter)="saveTaskEdit()"
                      (keydown.escape)="cancelTaskEdit()"
                      (blur)="saveTaskEdit()">
             </span>
           </div>
         </div>

         <ng-template #emptyState>
           <div class="empty-state">
             <h3>No tasks in {{ getActiveCategory()?.name || 'general' }}</h3>
             <p>Add a task to get started</p>
           </div>
         </ng-template>
        </ng-template>
      </div>

      <!-- Stats Box -->
      <div class="box">
        <div class="box-label">BOX 3: STATS</div>
        <div class="category-stats">
          <div class="stat-category" 
               [class.completed-category]="getCategoryStats(category.name).completed === getCategoryStats(category.name).total && getCategoryStats(category.name).total > 0"
               *ngFor="let category of categories">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-numbers">
              {{ getCategoryStats(category.name).completed }} / {{ getCategoryStats(category.name).total }}
            </div>
          </div>
        </div>
      </div>

      <app-radial-menu
        #radialMenu
        (optionSelected)="onRadialMenuOption($event)"
        (menuHidden)="onRadialMenuHidden()">
      </app-radial-menu>
    </div>
  `,
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  @ViewChild('radialMenu') radialMenu!: RadialMenuComponent;
  
  tasks: Task[] = [];
  allTasks: Task[] = [];
  categories: TaskCategory[] = [];
  activeCategory = 'general';
  newTaskTitle = '';
  editingTask: Task | null = null;
  editTaskTitle = '';
  currentDate = '';
  newCategoryName = '';
  showCategoryInput = false;
  showInputBox = false;
  hasCommandError = false;
  
  private destroy$ = new Subject<void>();
  private longPressTimer: any;
  private longPressDelay = 200; // ms

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.taskService.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
      });

    this.taskService.activeCategory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categoryName => {
        this.activeCategory = categoryName;
      });

    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allTasks => {
        this.allTasks = allTasks;
      });

    combineLatest([
      this.taskService.tasks$,
      this.taskService.activeCategory$
    ]).pipe(
      takeUntil(this.destroy$),
      map(([allTasks, activeCategory]) => 
        allTasks.filter(task => task.category === activeCategory)
      )
    ).subscribe(filteredTasks => {
      this.tasks = filteredTasks;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  get totalCount(): number { return this.tasks.length; }
  get completedCount(): number { return this.tasks.filter(t => t.completed).length; }

  get selectedTabIndex(): number {
    const index = this.categories.findIndex(c => c.name === this.activeCategory);
    return index >= 0 ? index : 0;
  }

  trackByTaskId(index: number, task: Task): string { return task.id; }

  getCategoryStats(categoryName: string): { total: number, completed: number, remaining: number, completionRate: number } {
    const categoryTasks = this.allTasks.filter(task => task.category === categoryName);
    const completed = categoryTasks.filter(task => task.completed).length;
    const total = categoryTasks.length;
    const remaining = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, completionRate };
  }

  handleInput(): void {
    const text = this.newTaskTitle.trim();
    if (!text) return;
    
    let isValidCommand = true;
    
    if (text === "///" || text.startsWith("/// ")) {
      isValidCommand = false;
    } else if (text.startsWith("///")) {
      const newCategoryName = text.slice(3).trim().toLowerCase();
      if (newCategoryName && !this.categories.find(c => c.name.toLowerCase() === newCategoryName)) {
        const colors = ['#4a7c4a', '#2d4a2d', '#6fa86f', '#3e6b3e', '#5a8a5a'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.taskService.addCategory(newCategoryName, randomColor);
      } else {
        isValidCommand = false;
      }
    } else if (text === "//" || text.startsWith("// ")) {
      isValidCommand = false;
    } else if (text.startsWith("//") && text.includes("-")) {
      const content = text.slice(2).trim();
      const dashIndex = content.indexOf("-");
      if (dashIndex > 0) {
        const oldName = content.slice(0, dashIndex).trim().toLowerCase();
        const newName = content.slice(dashIndex + 1).trim().toLowerCase();
        const categoryToRename = this.categories.find(c => c.name.toLowerCase() === oldName);
        if (categoryToRename && newName && !this.categories.find(c => c.name.toLowerCase() === newName)) {
          this.taskService.renameCategory(oldName, newName);
        } else {
          isValidCommand = false;
        }
      } else {
        isValidCommand = false;
      }
    } else if (text === "\\\\\\" || text.startsWith("\\\\\\ ")) {
      isValidCommand = false;
    } else if (text.startsWith("\\\\\\")) {
      const categoryName = text.slice(3).trim().toLowerCase();
      const categoryToDelete = this.categories.find(c => c.name.toLowerCase() === categoryName);
      if (categoryToDelete) {
        this.taskService.deleteCategory(categoryToDelete.name);
      } else {
        isValidCommand = false;
      }
    } else if (text.startsWith("//") || text.startsWith("\\\\")) {
      isValidCommand = false;
    } else {
      if (this.categories.length === 0) {
        isValidCommand = false;
      } else {
        this.taskService.addTask(text, this.activeCategory);
      }
    }
    
    if (isValidCommand) {
      this.newTaskTitle = '';
      this.clearCommandError();
      this.hideInputBox();
    } else {
      this.showCommandError();
    }
  }

  getActiveCategory() {
    return this.categories.find(c => c.name === this.activeCategory);
  }

  setActiveCategory(categoryName: string): void {
    this.taskService.setActiveCategory(categoryName);
  }

  toggleTaskCompletion(task: Task): void {
    this.taskService.updateTask(task.id, { completed: !task.completed });
  }

  toggleInputBox(): void {
    this.showInputBox = !this.showInputBox;
    if (this.showInputBox) {
      setTimeout(() => {
        const input = document.querySelector('.task-input input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }

  hideInputBox(): void { this.showInputBox = false; this.newTaskTitle = ''; this.clearCommandError(); }

  showCommandError(): void { this.hasCommandError = true; setTimeout(() => this.clearCommandError(), 2000); }
  clearCommandError(): void { this.hasCommandError = false; }

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const colors = ['#4a7c4a', '#2d4a2d', '#6fa86f', '#3e6b3e', '#5a8a5a'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.taskService.addCategory(this.newCategoryName, randomColor);
      this.newCategoryName = '';
      this.showCategoryInput = false;
    }
  }

  toggleCategoryInput(): void { this.showCategoryInput = !this.showCategoryInput; this.newCategoryName = ''; }
  deleteCategory(categoryName: string): void { if (categoryName !== 'general') this.taskService.deleteCategory(categoryName); }

  onTaskPointerDown(event: PointerEvent, task: Task): void {
    if (this.editingTask) return;
    
    // Skip if this is a touch pointer event (handled by touchstart)
    if (event.pointerType === 'touch') return;
    
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    const startX = event.clientX;
    const startY = event.clientY;
    let isLongPressActive = false;
    let hasMoved = false;
    this.longPressTimer = setTimeout(() => {
      isLongPressActive = true;
      element.classList.add('long-pressing');
      this.showRadialMenu(startX, startY, task);
      if ('vibrate' in navigator) navigator.vibrate(50);
      if (hasMoved) this.radialMenu.updateHighlight(event.clientX, event.clientY);
      setTimeout(() => element.classList.remove('long-pressing'), 200);
    }, this.longPressDelay);

    const cleanupListeners = () => {
      element.removeEventListener('pointerup', upHandler);
      element.removeEventListener('pointerleave', leaveHandler);
      element.removeEventListener('pointermove', moveHandler);
    };

    const upHandler = (upEvent: PointerEvent) => {
      if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
      if (isLongPressActive && this.radialMenu.visible) this.radialMenu.completeSelection();
      cleanupListeners();
    };

    const leaveHandler = () => { if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; } cleanupListeners(); };

    const moveHandler = (moveEvent: PointerEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      hasMoved = deltaX > 5 || deltaY > 5;
      if (isLongPressActive && this.radialMenu.visible) {
        moveEvent.preventDefault();
        moveEvent.stopPropagation();
        this.radialMenu.updateHighlight(moveEvent.clientX, moveEvent.clientY);
      } else if (!isLongPressActive && (deltaX > 10 || deltaY > 10)) {
        if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
      }
    };

    element.addEventListener('pointerup', upHandler);
    element.addEventListener('pointerleave', leaveHandler);
    element.addEventListener('pointermove', moveHandler);
  }

  onTaskTouchStart(event: TouchEvent, task: Task): void {
    if (this.editingTask) return;
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    const touch = event.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    let isLongPressActive = false;
    let hasMoved = false;
    this.longPressTimer = setTimeout(() => {
      isLongPressActive = true;
      element.classList.add('long-pressing');
      this.showRadialMenu(startX, startY, task);
      if ('vibrate' in navigator) navigator.vibrate(50);
      if (hasMoved && event.touches.length > 0) this.radialMenu.updateHighlight(event.touches[0].clientX, event.touches[0].clientY);
      setTimeout(() => element.classList.remove('long-pressing'), 200);
    }, this.longPressDelay);

    const cleanupListeners = () => {
      element.removeEventListener('touchend', endHandler);
      element.removeEventListener('touchcancel', cancelHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
    };

    const endHandler = (endEvent: TouchEvent) => {
      if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
      if (isLongPressActive && this.radialMenu.visible) this.radialMenu.completeSelection();
      cleanupListeners();
    };

    const cancelHandler = () => { if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; } cleanupListeners(); };

    const touchMoveHandler = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        const moveTouch = moveEvent.touches[0];
        const deltaX = Math.abs(moveTouch.clientX - startX);
        const deltaY = Math.abs(moveTouch.clientY - startY);
        hasMoved = deltaX > 5 || deltaY > 5;
        if (isLongPressActive && this.radialMenu.visible) {
          moveEvent.preventDefault();
          moveEvent.stopPropagation();
          this.radialMenu.updateHighlight(moveTouch.clientX, moveTouch.clientY);
        } else if (!isLongPressActive && (deltaX > 10 || deltaY > 10)) {
          if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
        }
      }
    };

    element.addEventListener('touchend', endHandler);
    element.addEventListener('touchcancel', cancelHandler);
    element.addEventListener('touchmove', touchMoveHandler);
  }

  onTaskContextMenu(event: MouseEvent, task: Task): void { 
    // Prevent browser context menu but don't show radial menu
    // Radial menu should only appear on long press
    event.preventDefault(); 
  }
  private showRadialMenu(x: number, y: number, task: Task): void { this.radialMenu.show(x, y, task.id, task.title); }

  onRadialMenuOption(event: RadialMenuEvent): void {
    const task = this.tasks.find(t => t.id === event.taskId);
    if (!task) return;
    switch (event.option.id) {
      case 'complete': this.taskService.updateTask(task.id, { completed: !task.completed }); break;
      case 'edit': this.startTaskEdit(task); break;
      case 'delete': this.taskService.deleteTask(task.id); break;
    }
  }

  onRadialMenuHidden(): void {}

  private startTaskEdit(task: Task): void {
    this.editingTask = task;
    this.editTaskTitle = task.title;
    setTimeout(() => {
      const input = document.querySelector('.task-edit-input') as HTMLInputElement;
      if (input) { input.focus(); input.select(); }
    }, 100);
  }

  saveTaskEdit(): void {
    if (this.editingTask && this.editTaskTitle.trim()) {
      this.taskService.updateTask(this.editingTask.id, { title: this.editTaskTitle.trim() });
    }
    this.cancelTaskEdit();
  }

  cancelTaskEdit(): void { this.editingTask = null; this.editTaskTitle = ''; }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
} 
