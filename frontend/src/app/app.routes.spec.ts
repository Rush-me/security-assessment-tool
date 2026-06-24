import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';

describe('app routes', () => {
  it('should define the core routes', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);

    const loginRoute = routes.find(r => r.path === 'login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute?.loadComponent).toBeDefined();

    const registerRoute = routes.find(r => r.path === 'register');
    expect(registerRoute).toBeDefined();
    expect(registerRoute?.loadComponent).toBeDefined();

    const dashboardRoute = routes.find(r => r.path === '');
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.canActivate).toContain(authGuard);
    expect(dashboardRoute?.loadComponent).toBeDefined();

    const projectRoute = routes.find(r => r.path === 'project/:projectId');
    expect(projectRoute).toBeDefined();
    expect(projectRoute?.canActivate).toContain(authGuard);
    expect(projectRoute?.loadComponent).toBeDefined();
    expect(projectRoute?.children).toBeDefined();
    expect(projectRoute?.children?.length).toBeGreaterThan(0);
  });

  it('should redirect wildcard path to home', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.redirectTo).toBe('');
  });
});
