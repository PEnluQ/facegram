import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/auth.service';

declare global {
  interface Window {
    Telegram: any;
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  tg: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.initializeTelegram();
    } else {
      window.addEventListener('load', () => {
        this.initializeTelegram();
      });
    }
  }

  initializeTelegram() {
    this.tg = window.Telegram.WebApp;
    this.tg.ready();

    let start = this.tg.initDataUnsafe?.start_param as string | undefined;
    if (!start) {
      const params = new URLSearchParams(window.location.search);
      start = params.get('tgWebAppStartParam') ?? undefined;
    }
    if (start && start.startsWith('chat_invite_')) {
      const token = start.substring('chat_invite_'.length);
      if (this.auth.isChatAllowed()) {
        this.router.navigate(['/chat']);
      } else {
        this.router.navigate(['/invite', token]);
      }
    }

    const initData = this.tg.initData || '';
    console.log('initData из Telegram:', initData);

    if (initData && !this.auth.isAuthenticated()) {
      this.auth.loginViaTelegram(initData).subscribe({
        next: res => this.auth.saveAuth(res.token, res.role),
        error: err => {
          console.error('Ошибка авторизации:', err);
          this.auth.logout(err.status === 403);
          if (err.status === 403) {
            this.router.navigate(['/blocked']);
          }
        }
      });
    } else {
      console.log('initData отсутствует или уже авторизован');
      if (this.auth.isAuthenticated()) {
        if (this.auth.getRole() === 'CLIENT') {
          this.auth.resumeClientInvite();
        } else {
          this.auth.refreshToken();
        }
      }
    }

    console.log(this.tg.initDataUnsafe);
    console.log("строка для сервера " + this.tg.initData);
  }
}
