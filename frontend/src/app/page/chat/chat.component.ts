import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { CardModule }    from 'primeng/card';
import { ButtonModule }  from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../core/auth.service';


@Component({
  selector: 'app-chat',
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
    <div *ngIf="canInvite" class="mt-3">
      <button pButton label="Создать чат" class="ml-2" (click)="createChat()"></button>
      <p *ngIf="inviteLink" class="mt-2">Invite: <a [routerLink]="['/chat', roomId]">{{ inviteLink }}
      </a></p>
    </div>
  `,
})

export class ChatComponent {
  roomId: string | null = null;
  inviteLink: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {
    this.roomId = this.route.snapshot.paramMap.get('id');
  }

  get canInvite(): boolean {
    const role = this.auth.getRole();
    return role === 'WAGESLAVE' || role === 'ADMIN';
  }

  createChat() {
    const obs = this.auth.createInvite();
    if (!obs) { return; }
    obs.subscribe({
      next: link => {
        const tokenIndex = link.lastIndexOf('_');
        const token = tokenIndex >= 0 ? link.substring(tokenIndex + 1) : link;
        this.auth.setChatRoomToken(token);
        this.router.navigate(['/chat', token]);
      }
    });
  }

}
