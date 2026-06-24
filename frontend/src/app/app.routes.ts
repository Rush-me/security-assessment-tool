import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'project/:projectId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/project-layout/project-layout.component').then(m => m.ProjectLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'basic-info',
        pathMatch: 'full'
      },
      {
        path: 'basic-info',
        loadComponent: () => import('./features/basic-info/basic-info.component').then(m => m.BasicInfoComponent)
      },
      {
        path: 'context',
        loadComponent: () => import('./features/project-context/project-context.component').then(m => m.ProjectContextComponent)
      },
      {
        path: 'business-assets',
        loadComponent: () => import('./features/business-assets/business-assets.component').then(m => m.BusinessAssetsComponent)
      },
      {
        path: 'supporting-assets',
        loadComponent: () => import('./features/supporting-assets/supporting-assets.component').then(m => m.SupportingAssetsComponent)
      },
      {
        path: 'vulnerabilities',
        loadComponent: () => import('./features/vulnerabilities/vulnerabilities.component').then(m => m.VulnerabilitiesComponent)
      },
      {
        path: 'risks',
        loadComponent: () => import('./features/risks/risks.component').then(m => m.RisksComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
