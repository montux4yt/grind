import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="settings-container">
      <div class="settings-content">
        <!-- Theme Settings Box -->
      <div class="box" style="margin-top: 10px;">
        <div class="box-label">box 1: theme</div>
        <div class="settings-section">
          <div class="setting-actions no-stack">
            <button mat-stroked-button (click)="applyDefaultTheme()">Default</button>
            <button mat-stroked-button (click)="toggleThemeEdit()">{{ themeEditMode ? 'Save' : 'Edit' }}</button>
          </div>
          <div class="setting-actions" *ngIf="themeEditMode">
            <mat-form-field appearance="outline" class="task-input" style="flex:1;">
              <input matInput class="theme-input-field" [(ngModel)]="newThemeColor" placeholder="#4a7c4a" />
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Data Management Box -->
      <div class="box">
        <div class="box-label">box 2: data</div>
        <div class="settings-section">
          <div class="setting-item">
            <span class="setting-label">Storage:</span>
            <span class="setting-value">Local Browser Storage</span>
          </div>
          <div class="setting-actions">
            <button mat-stroked-button (click)="importData()">
              Import Data
            </button>
            <button mat-stroked-button (click)="exportData()">
              Export Data
            </button>
            <button mat-stroked-button class="danger-button" (click)="onClearClicked()">
              {{ clearButtonLabel }}
            </button>
          </div>
          <div class="setting-description">
            Tasks are stored locally in your browser
          </div>
        </div>
      </div>

      <!-- Commands Box -->
      <div class="box">
        <div class="box-label">box 3: help</div>
        <div class="settings-section">
          <div class="help-content">
            <div class="command-item">
              <code>///TabName</code>
              <span>Add new category</span>
            </div>
            <div class="command-item">
              <code>//OldName-NewName</code>
              <span>Rename category</span>
            </div>
            <div class="command-item">
              <code>\u005C\u005C\u005CTabName</code>
              <span>Remove category</span>
            </div>
            <div class="command-item">
              <code>Long Press Task</code>
              <span>Show options menu</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private taskService: TaskService) {}

  // Theme controls
  themeEditMode = false;
  newThemeColor = '';
  private readonly THEME_COLOR_KEY = 'grind_theme_color';
  private readonly DEFAULT_THEME_COLOR = '#4a7c4a';

  ngOnInit(): void {
    const stored = localStorage.getItem(this.THEME_COLOR_KEY);
    if (stored && this.isValidHex(stored)) {
      this.applyThemeColor(stored, false);
    }
  }

  toggleThemeEdit(): void {
    if (this.themeEditMode) {
      this.saveThemeColor();
    } else {
      this.themeEditMode = true;
      const current = localStorage.getItem(this.THEME_COLOR_KEY) || this.DEFAULT_THEME_COLOR;
      this.newThemeColor = current;
      setTimeout(() => {
        const input = document.querySelector('.theme-input-field') as HTMLInputElement | null;
        if (input) { input.focus(); input.select(); }
      }, 0);
    }
  }

  applyDefaultTheme(): void {
    this.applyThemeColor(this.DEFAULT_THEME_COLOR);
    this.themeEditMode = false;
    this.newThemeColor = '';
  }

  saveThemeColor(): void {
    const color = (this.newThemeColor || '').trim();
    if (this.isValidHex(color)) {
      this.applyThemeColor(color);
      this.themeEditMode = false;
    }
  }

  private isValidHex(value: string): boolean {
    return /^#([0-9a-fA-F]{6})$/.test(value);
  }

  private applyThemeColor(color: string, persist: boolean = true): void {
    try {
      const root = document.documentElement;
      root.style.setProperty('--primary-green', color);

      const { r, g, b } = this.hexToRgb(color);
      root.style.setProperty('--primary-green-rgb', `${r}, ${g}, ${b}`);
      root.style.setProperty('--primary-green-10', `rgba(${r}, ${g}, ${b}, 0.10)`);
      root.style.setProperty('--primary-green-20', `rgba(${r}, ${g}, ${b}, 0.20)`);
      root.style.setProperty('--primary-green-40', `rgba(${r}, ${g}, ${b}, 0.40)`);
      root.style.setProperty('--primary-green-50', `rgba(${r}, ${g}, ${b}, 0.50)`);
      root.style.setProperty('--primary-green-70', `rgba(${r}, ${g}, ${b}, 0.70)`);

      const hover = this.mixWithWhite({ r, g, b }, 0.2);
      root.style.setProperty('--primary-green-hover', `rgb(${hover.r}, ${hover.g}, ${hover.b})`);

      const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (meta) {
        meta.content = color;
      }
      if (persist) {
        localStorage.setItem(this.THEME_COLOR_KEY, color);
      }
    } catch {}
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const normalized = hex.replace('#', '');
    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    return { r, g, b };
  }

  private mixWithWhite(rgb: { r: number; g: number; b: number }, amount: number): { r: number; g: number; b: number } {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const r = clamp(rgb.r + (255 - rgb.r) * amount);
    const g = clamp(rgb.g + (255 - rgb.g) * amount);
    const b = clamp(rgb.b + (255 - rgb.b) * amount);
    return { r, g, b };
  }

  // Triple-click clear behavior
  clearClickCount = 0;
  private clearClickTimer: any = null;
  private readonly clearClickWindowMs = 3000;
  clearButtonLabel = 'Clear All Data';

  private resetClearClickState(): void {
    this.clearClickCount = 0;
    this.clearButtonLabel = 'Clear All Data';
    if (this.clearClickTimer) {
      clearTimeout(this.clearClickTimer);
      this.clearClickTimer = null;
    }
  }

  onClearClicked(): void {
    if (!this.clearClickTimer) {
      this.clearClickTimer = setTimeout(() => this.resetClearClickState(), this.clearClickWindowMs);
    }

    this.clearClickCount += 1;
    const remaining = Math.max(0, 3 - this.clearClickCount);
    this.clearButtonLabel = remaining > 0 ? `Clear All Data (${this.clearClickCount}/3)` : 'Clearing...';

    if (this.clearClickCount >= 3) {
      this.executeClear();
    }
  }

  private executeClear(): void {
    try {
      localStorage.clear();
      localStorage.setItem('grind_suppress_defaults', 'true');
    } finally {
      this.resetClearClickState();
      window.location.reload();
    }
  }

  exportData(): void {
    const tasks = localStorage.getItem('grind_tasks') || '[]';
    const categories = localStorage.getItem('grind_categories') || '[]';
    const themeColor = localStorage.getItem(this.THEME_COLOR_KEY) || this.DEFAULT_THEME_COLOR;
    
    const exportData = {
      tasks: JSON.parse(tasks),
      categories: JSON.parse(categories),
      themeColor,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `grind-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importData(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Clear all existing data before applying import
          localStorage.clear();

          const text = String(reader.result || '');
          const parsed = JSON.parse(text);

          let incomingTasks: any[] = [];
          let incomingCategories: any[] = [];
          let incomingThemeColor: string | undefined;

          if (Array.isArray(parsed)) {
            incomingTasks = parsed;
          } else if (parsed && (Array.isArray(parsed.tasks) || Array.isArray(parsed.categories))) {
            incomingTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
            incomingCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
            if (typeof parsed.themeColor === 'string') {
              incomingThemeColor = parsed.themeColor;
            }
          } else {
            console.warn('Invalid file format. Provide a JSON backup or an array of tasks.');
            return;
          }

          // Apply imported theme color if valid; otherwise keep default
          const colorToApply = (incomingThemeColor && this.isValidHex(incomingThemeColor))
            ? incomingThemeColor
            : this.DEFAULT_THEME_COLOR;
          this.applyThemeColor(colorToApply, true);

          // Sanitize and persist categories if provided (no auto-adding any default)
          let sanitizedCategories: Array<{ id: string; name: string; color: string; createdAt: Date }> = [];
          if (incomingCategories.length > 0) {
            const seenIds = new Set<string>();
            const seenNames = new Set<string>();
            sanitizedCategories = incomingCategories
              .filter(c => c && (typeof c.name === 'string' || typeof c.id === 'string'))
              .map(c => ({
                id: typeof c.id === 'string' && c.id ? c.id : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
                name: String((c.name ?? '')).trim().toLowerCase(),
                color: typeof c.color === 'string' && c.color ? c.color : colorToApply,
                createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
              }))
              .filter(cat => {
                const keyId = cat.id;
                const keyName = cat.name;
                if (!keyName) return false;
                if (seenIds.has(keyId) || seenNames.has(keyName)) return false;
                seenIds.add(keyId);
                seenNames.add(keyName);
                return true;
              });

            localStorage.setItem('grind_categories', JSON.stringify(sanitizedCategories));
            this.taskService.reloadCategoriesFromStorage();
          }

          // Prepare category name lookup
          const categoriesRaw = localStorage.getItem('grind_categories');
          const existingCategories = categoriesRaw ? JSON.parse(categoriesRaw) as Array<{ id: string; name: string }> : [];
          const idToName = new Map(existingCategories.map(c => [c.id, String(c.name).toLowerCase()] as [string, string]));
          const nameSet = new Set(existingCategories.map(c => String(c.name).toLowerCase()));

          // Sanitize tasks and map category to name (no defaulting to 'general')
          const sanitizedTasks = incomingTasks
            .filter(t => t && typeof t.title === 'string')
            .map(t => {
              const rawCategory = t.category;
              let categoryName: string = '';
              if (typeof rawCategory === 'string' && rawCategory) {
                const byId = idToName.get(rawCategory);
                const byName = String(rawCategory).toLowerCase();
                categoryName = byId || (nameSet.has(byName) ? byName : '');
              }
              return {
                id: typeof t.id === 'string' && t.id ? t.id : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
                title: String(t.title).trim(),
                completed: Boolean(t.completed),
                createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
                completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                category: categoryName
              };
            });

          localStorage.setItem('grind_tasks', JSON.stringify(sanitizedTasks));
          this.taskService.reloadTasksFromStorage();
          // No alerts on success
        } catch (err) {
          console.error('Failed to import. Ensure the file is valid JSON.', err);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }
} 
