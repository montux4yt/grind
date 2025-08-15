import { Routes } from '@angular/router';
import { MainShellComponent } from './components/main-shell/main-shell.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: MainShellComponent,
    children: [
      {
        path: '',
        component: TaskListComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
