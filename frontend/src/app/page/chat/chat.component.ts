import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { CardModule }    from 'primeng/card';
import { ButtonModule }  from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import {Router, RouterModule} from '@angular/router';
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
    <div class="content-wrapper"></div>

    <div *ngIf="canInvite" class="mt-3">
      <button pButton label="Создать чат" class="ml-2" (click)="createChat()"></button>
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

export class ChatComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    if (this.auth.getRole() === 'GUEST') {
      const token = this.auth.getChatRoomToken();
      if (token) {
        this.router.navigate(['/chat', token]);
      }
    }
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
