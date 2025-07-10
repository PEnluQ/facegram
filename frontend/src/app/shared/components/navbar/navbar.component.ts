import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BadgeModule} from 'primeng/badge';
import {AvatarModule} from 'primeng/avatar';
import {RippleModule} from 'primeng/ripple';
import {InputTextModule} from 'primeng/inputtext';
import {Router, RouterModule, NavigationEnd} from '@angular/router';
import {MenubarModule} from 'primeng/menubar';

@Component({
  selector: "navbar-main",
  imports: [
    CommonModule,
    BadgeModule,
    AvatarModule,
    RippleModule,
    InputTextModule,
    RouterModule,
    MenubarModule
  ],
  template: `
    <div class="icon-toolbar">

      <button class="p-button-text" [class.active]="url === '/'" (click)="goTo('/')">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 12L14 5L23 12" stroke="#229ED9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="7" y="12" width="14" height="9" rx="2" stroke="#229ED9" stroke-width="2"/>
        </svg>
      </button>

      <button class="p-button-text" [class.active]="url === '/chat'" (click)="goTo('/chat')">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 21V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-3 3z" stroke="#229ED9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>

      <button class="p-button-text" [class.active]="url === '/settings'" (click)="goTo('/settings')">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="4" stroke="#229ED9" stroke-width="2"/>
          <path d="M22 14a8 8 0 0 0-.6-3l2-1.7-2-3.5-2.3 1a8.12 8.12 0 0 0-2.4-1.3L16 4h-4l-.7 2.5a8.12 8.12 0 0 0-2.4 1.3l-2.3-1-2 3.5 2 1.7A8 8 0 0 0 6 14a8 8 0 0 0 .6 3l-2 1.7 2 3.5 2.3-1a8.12 8.12 0 0 0 2.4 1.3L12 24h4l.7-2.5a8.12 8.12 0 0 0 2.4-1.3l2.3 1 2-3.5-2-1.7a8 8 0 0 0 .6-3z" stroke="#229ED9" stroke-width="2" fill="none"/>
        </svg>
      </button>
    </div>

  `,
  styles: [`
    .icon-toolbar {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100vw;
      height: 60px;
      margin: 0;
      padding: 1.2rem 2rem 3rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      background: #fff;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
      z-index: 1000;
      overflow: hidden;
      border: none;
    }

    .p-button-text {
      background: transparent;
      border: none;
      margin: 0 0.5rem;
      padding: 0;
      height: 44px;
      width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .p-button-text.active {
      background: #ddf8;
      border-radius: 8px    ;
    }
    .p-button-text svg {
      display: block;
      width: 28px;
      height: 28px;
    }
    .p-button-text:active,
    .p-button-text:focus,
    .p-button-text:hover {
      background: #e8f5fd;
    }

  `]
})

export class NavbarComponent {
  url = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd){
        this.url = event.urlAfterRedirects;
      }
    });
  }

  goTo(path: string) {
    if (this.url !== path) {
      this.router.navigate([path]);
    }
  }
}
