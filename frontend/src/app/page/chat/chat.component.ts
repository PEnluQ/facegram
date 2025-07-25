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
    <div class="content-wrapper">
        <button pButton severity="danger" label="Подробнее" icon="pi pi-info-circle"></button>
    </div>

    <div *ngIf="canInvite" class="mt-3">
      <button pButton label="Create Invite" class="ml-2" (click)="createInvite()"></button>
      <p *ngIf="inviteLink" class="mt-2">Invite: <a [href]="inviteLink">{{ inviteLink }}</a></p>
    </div>
  `,
  styles: [`
    .content-wrapper {
      padding: 1rem;
    }
    .footer {
      justify-content: center;
      margin-top: 2rem;
    }
  `]
})

export class ChatComponent {
  roomId: string | null = null;
  inviteLink: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.roomId = this.route.snapshot.paramMap.get('id');
  }

  get canInvite(): boolean {
    const role = this.auth.getRole();
    return role === 'WAGESLAVE' || role === 'ADMIN';
  }

  createInvite() {
    const obs = this.auth.createInvite();
    if (!obs) { this.inviteLink = 'Not authenticated'; return; }
    obs.subscribe({
      next: link => this.inviteLink = link,
      error: () => this.inviteLink = 'Failed'
    });
  }

}
