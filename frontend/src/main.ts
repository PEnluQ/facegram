import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter, Routes} from '@angular/router';
import {HomeLayoutComponent} from './app/features/home-layout/home-layout.component';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import 'primeicons/primeicons.css';
import {SettingsComponent} from './app/features/settings/settings.component';
import {ChatComponent} from './app/features/chat/chat.component';
import {HomePageComponent} from './app/page/home-page/home-page.component';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {AuthInterceptor} from './app/core/api.interceptor';
import {ChatGuard} from './app/core/auth.guard';

const routes: Routes = [
  {
    path: '', component: HomeLayoutComponent, children: [
      {path: '', component: HomePageComponent},
      {path: 'settings', component: SettingsComponent},
      { path: 'chat', component: ChatComponent, canActivate: [ChatGuard] },
      { path: 'chat/:id', component: ChatComponent, canActivate: [ChatGuard] },
    ]
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    providePrimeNG({
      theme: {preset: Aura
      }})
  ]
})
  .catch((err) => console.error(err));
