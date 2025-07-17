import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../core/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'blocked-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-wrapper">
      <p>Вы заблокированы за нарушение правил использования сервиса.<br>Для выяснения пишите менеджеру.</p>
    </div>
  `,
  styles: [`
    .content-wrapper { padding: 1rem; text-align: center; }
  `]
})

export class BlockedPageComponent implements OnInit, OnDestroy {
  private retryId: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkIfUnblocked();
    this.retryId = setInterval(() => this.checkIfUnblocked(), 10000);
  }

  private checkIfUnblocked() {
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData || '';
    if (!initData) return;

    this.auth.loginViaTelegram(initData).subscribe({
      next: res => {
        this.auth.saveAuth(res.token, res.role);
        this.router.navigate(['/']);
      },
      error: () => {
        // still blocked or network issue
      }
    });
  }

  ngOnDestroy() {
    if (this.retryId) {
      clearInterval(this.retryId);
    }
  }
}
