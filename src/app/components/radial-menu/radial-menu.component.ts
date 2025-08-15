import { Component, Input, Output, EventEmitter, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RadialMenuOption {
  id: string;
  label: string;
  icon: string;
  angle: number;
}

export interface RadialMenuEvent {
  option: RadialMenuOption;
  taskId: string;
}

@Component({
  selector: 'app-radial-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radial-menu-overlay" 
         [class.visible]="visible"
         (click)="onOverlayClick($event)"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd($event)"
         (mousedown)="onMouseDown($event)"
         (mousemove)="onMouseMove($event)"
         (mouseup)="onMouseUp($event)">
      
      <div class="radial-menu" 
           [style.left.px]="centerX - 80" 
           [style.top.px]="centerY - 80">
        
        <div class="menu-center">
          <div class="task-preview">{{ taskTitle }}</div>
        </div>
        
        <div class="menu-option" 
             *ngFor="let option of options"
             [class.highlighted]="highlightedOption?.id === option.id"
             [style.transform]="getOptionTransform(option.angle)">
          <div class="option-content">
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./radial-menu.component.css']
})
export class RadialMenuComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() centerX = 0;
  @Input() centerY = 0;
  @Input() taskId = '';
  @Input() taskTitle = '';
  
  @Output() optionSelected = new EventEmitter<RadialMenuEvent>();
  @Output() menuHidden = new EventEmitter<void>();

  options: RadialMenuOption[] = [
    { id: 'complete', label: 'Toggle', icon: 'T', angle: -90 }, // Top
    { id: 'edit', label: 'Edit', icon: 'E', angle: 30 },        // Bottom-right  
    { id: 'delete', label: 'Delete', icon: 'D', angle: 150 }    // Bottom-left
  ];

  highlightedOption: RadialMenuOption | null = null;
  private isDragging = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Add escape key listener
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    
    // Ensure body scrolling is restored if component is destroyed while visible
    if (this.visible) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.visible) {
      this.hide();
    }
  }

  onOverlayClick(event: Event): void {
    event.stopPropagation();
    if (!this.isDragging) {
      this.hide();
    }
  }

  onTouchStart(event: TouchEvent): void {
    // Don't handle touch events here anymore - handled by task component
    event.preventDefault();
    event.stopPropagation();
  }

  onTouchMove(event: TouchEvent): void {
    // Don't handle touch events here anymore - handled by task component
    event.preventDefault();
    event.stopPropagation();
  }

  onTouchEnd(event: TouchEvent): void {
    // Don't handle touch events here anymore - handled by task component
    event.preventDefault();
    event.stopPropagation();
  }

  onMouseDown(event: MouseEvent): void {
    // Don't handle mouse events here anymore - handled by task component
    event.preventDefault();
    event.stopPropagation();
  }

  onMouseMove(event: MouseEvent): void {
    // Don't handle mouse events here anymore - handled by task component
    event.preventDefault();
    event.stopPropagation();
  }

  onMouseUp(event: MouseEvent): void {
    // Don't handle mouse events here anymore - handled by task component
    event.preventDefault();
    event.stopPropagation();
  }

  private updateHighlightedOption(x: number, y: number): void {
    const distance = this.getDistance(x, y, this.centerX, this.centerY);
    
    if (distance < 40) {
      this.highlightedOption = null;
      return;
    }

    if (distance > 120) {
      this.highlightedOption = null;
      return;
    }

    const angle = this.getAngle(x, y, this.centerX, this.centerY);
    this.highlightedOption = this.getClosestOption(angle);
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  private getAngle(x: number, y: number, centerX: number, centerY: number): number {
    const radians = Math.atan2(y - centerY, x - centerX);
    let degrees = radians * (180 / Math.PI);
    return degrees < 0 ? degrees + 360 : degrees;
  }

  private getClosestOption(angle: number): RadialMenuOption {
    let closest = this.options[0];
    let smallestDiff = Math.abs(angle - closest.angle);

    for (const option of this.options) {
      const diff = Math.min(
        Math.abs(angle - option.angle),
        Math.abs(angle - (option.angle + 360)),
        Math.abs(angle - (option.angle - 360))
      );
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closest = option;
      }
    }

    return closest;
  }

  getOptionTransform(angle: number): string {
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * 65; // Closer distance from center
    const y = Math.sin(radians) * 65; // Closer distance from center
    return `translate(${x}px, ${y}px)`;
  }

  private selectOption(option: RadialMenuOption): void {
    console.log('Option selected:', option.label, 'for task:', this.taskId); // Debug log
    this.optionSelected.emit({
      option,
      taskId: this.taskId
    });
  }

  show(x: number, y: number, taskId: string, taskTitle: string): void {
    this.centerX = x;
    this.centerY = y;
    this.taskId = taskId;
    this.taskTitle = taskTitle;
    this.visible = true;
    this.highlightedOption = null;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  hide(): void {
    this.visible = false;
    this.highlightedOption = null;
    
    // Restore body scrolling
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    this.menuHidden.emit();
  }

  updateHighlight(x: number, y: number): void {
    this.updateHighlightedOption(x, y);
  }

  completeSelection(): void {
    if (this.highlightedOption) {
      this.selectOption(this.highlightedOption);
    }
    this.hide();
  }
} 