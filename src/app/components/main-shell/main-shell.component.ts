import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';


@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  template: `
    <div class="shell-container">
      <!-- Top Navigation - Karui Style -->
      <nav class="top-nav">
        <div class="nav-left">
          <button class="nav-item" 
                  [class.active]="currentRoute === '/'"
                  (click)="navigateTo('/')">
            <span>Main</span>
          </button>
          
          <button class="nav-item" 
                  [class.active]="currentRoute === '/settings'"
                  (click)="navigateTo('/settings')">
            <span>Settings</span>
          </button>
        </div>
        
        <div class="nav-right">
          <div class="total-stats" [class.all-completed]="allTasksCompleted">
            {{ totalCompleted }} / {{ totalTasks }}
          </div>
        </div>
      </nav>
      
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./main-shell.component.css']
})
export class MainShellComponent implements OnInit, OnDestroy {
  currentRoute = '/';
  allTasks: Task[] = [];
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private taskService: TaskService) {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.currentRoute = event.urlAfterRedirects || this.router.url;
        this.resetScrollPositions();
      });
  }

  ngOnInit(): void {
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allTasks => {
        this.allTasks = allTasks;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetScrollPositions(): void {
    try {
      const selectors = ['.task-list-container', '.settings-container'];
      for (const sel of selectors) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          el.scrollTop = 0;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {}
  }

  get totalTasks(): number {
    return this.allTasks.length;
  }

  get totalCompleted(): number {
    return this.allTasks.filter(task => task.completed).length;
  }

  get allTasksCompleted(): boolean {
    return this.allTasks.length > 0 && this.totalCompleted === this.totalTasks;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
} 