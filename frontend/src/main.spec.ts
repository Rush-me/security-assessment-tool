import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

describe('main.ts bootstrap entry point', () => {
  it('should have bootstrapApplication, appConfig, and AppComponent defined', () => {
    expect(bootstrapApplication).toBeDefined();
    expect(appConfig).toBeDefined();
    expect(AppComponent).toBeDefined();
  });
});
