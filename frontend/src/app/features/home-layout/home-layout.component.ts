// src/app/features/home-layout/settings.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { CardModule }    from 'primeng/card';
import { ButtonModule }  from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import {Router, RouterModule} from '@angular/router';
import {NavbarComponent} from '../../shared/components/navbar/navbar.component';
import {AuthService} from '../../core/auth.service';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    ToolbarModule,
    NavbarComponent
  ],
  template: `
    <div class="content-wrapper">
      <router-outlet />
      <navbar-main *ngIf="!auth.isBlocked()"></navbar-main>
    </div>
  `,
  styles: [`
    .content-wrapper {
      padding: 1rem;
    }
  `]
})

export class HomeLayoutComponent {
  isMainPage = false;

  constructor(private router: Router, public auth: AuthService) {
    this.router.events.subscribe(() => {
      this.isMainPage = this.router.url === '/';
    });
  }
}
