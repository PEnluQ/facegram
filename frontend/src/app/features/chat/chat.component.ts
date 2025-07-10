import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { CardModule }    from 'primeng/card';
import { ButtonModule }  from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NavbarComponent} from '../../shared/components/navbar/navbar.component';
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
      <p-card header="Добро пожаловать!">
        <p>Chatik</p>
        <button pButton severity="danger" label="Подробнее" icon="pi pi-info-circle"></button>
      </p-card>
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

  constructor(private route: ActivatedRoute, private router: Router) {
    this.roomId = this.route.snapshot.paramMap.get('id');
  }
}
