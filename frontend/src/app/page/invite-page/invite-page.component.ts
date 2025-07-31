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
  message = 'Идет соединение...';

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.message = 'Invalid link';
      this.auth.clearChatRoomToken();
      return;
    }
    if (this.auth.isChatAllowed()) {
      this.auth.setChatRoomToken(token);
      this.router.navigate(['/chat', token]);
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
        this.auth.setChatRoomToken(invite);
        this.message = 'Invite accepted';
        this.router.navigate(['/chat', invite]);
      },
      error: () => {
        this.message = 'Invite invalid';
        this.auth.clearChatRoomToken();
      }
    });
  }
}
