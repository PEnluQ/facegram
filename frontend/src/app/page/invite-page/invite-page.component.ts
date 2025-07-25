import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'invite-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-wrapper">
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .content-wrapper { padding: 1rem; text-align: center; }
  `]
})
export class InvitePageComponent implements OnInit {
  message = 'Processing...';

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.message = 'Invalid link';
      return;
    }

    if (this.auth.isChatAllowed()) {
      this.router.navigate(['/chat']);
      return;
    }
    this.tryAccept(token);
  }

  private tryAccept(invite: string) {
    const obs = this.auth.acceptInvite(invite);
    if (!obs) {
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData || '';
      if (!initData) { this.message = 'Not authenticated'; return; }
      this.auth.loginViaTelegram(initData).subscribe({
        next: res => {
          this.auth.saveAuth(res.token, res.role);
          this.tryAccept(invite);
        },
        error: () => this.message = 'Failed to authenticate'
      });
      return;
    }
    obs.subscribe({
      next: res => {
        this.auth.saveAuth(res.token, res.role);
        if ((res as any).expiresAt) {
          this.auth.setInviteExpiration((res as any).expiresAt);
        }
        this.message = 'Invite accepted';
        this.router.navigate(['/chat']);
      },
      error: err => {
          this.message = err;
      }
    });
  }
}
