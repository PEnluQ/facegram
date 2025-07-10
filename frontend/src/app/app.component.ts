import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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

  constructor(private auth: AuthService) {}

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

    const initData = this.tg.initData || '';
    console.log('initData из Telegram:', initData);

    if (initData && !this.auth.isAuthenticated()) {
      this.auth.loginViaTelegram(initData).subscribe({
        next: res => this.auth.saveAuth(res.token, res.role),
        error: err => {
          console.error('Ошибка авторизации:', err);
          this.auth.logout();
        }
      });
    } else {
      console.log('initData отсутствует или уже авторизован');
    }

    console.log(this.tg.initDataUnsafe); // объект с юзером
    console.log("строка для сервера " + this.tg.initData);
  }
}
