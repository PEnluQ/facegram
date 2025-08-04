import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MenubarModule} from 'primeng/menubar';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {ToolbarModule} from 'primeng/toolbar';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../core/auth.service';

@Component({
  selector: 'chat-room',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    ToolbarModule,
  ],
  template: `
    <div class="content-wrapper">
      <p *ngIf="inviteLink">Invite: <a [href]="inviteLink">{{ inviteLink }}</a></p>
      <p *ngIf="author">Создал: {{ author }}</p>
      <p *ngIf="guest">Гость: {{ guest }}</p>
      <button *ngIf="canExit" pButton label="Выход" class="mt-2" (click)="exit()"></button>
    </div>
  `,
  styles: [`
    .content-wrapper {
      padding: 1rem;
    }
  `]
})

export class ChatRoomComponent implements OnDestroy {
  inviteLink: string | null = null;
  author: string | null = null;
  guest: string | null = null;
  canExit = false;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {
    const token = this.route.snapshot.paramMap.get('id');
    if (token) {
      this.auth.setChatRoomToken(token);
      this.inviteLink = `https://t.me/FaceGrammBot/faces?startapp=chat_invite_${token}`;
      const obs = this.auth.getInviteInfo(token);
      obs?.subscribe({
        next: info => {
          this.author = info.author;
          this.guest = info.guest;
        }
      });
    }
    const role = this.auth.getRole();
    this.canExit = role === 'WAGESLAVE' || role === 'ADMIN';
  }

  exit() {
    this.auth.clearChatRoomToken();
    this.router.navigate(['/chat']);
  }

  ngOnDestroy() {
    if (this.auth.getRole() === 'GUEST') {
      this.auth.clearChatRoomToken();
      this.router.navigate(['/chat']);
    }
  }
}
