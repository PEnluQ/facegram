import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective, InputTextModule],
  template: `
    <div class="content-wrapper">
      <input [(ngModel)]="username" placeholder="Guest username" />
      <button pButton (click)="promote()" label="Promote"></button>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .content-wrapper {
      padding: 1rem;
    }
  `]
})
export class AdminPageComponent {
  username = '';
  message = '';

  constructor(private http: HttpClient) {}

  promote() {
    const name = this.username.trim();
    if (!name) return;
    this.http.post(`${environment.apiUrl}/admin/users/wageslave?username=${name}`, {}).subscribe({
      next: () => this.message = 'User promoted',
      error: () => this.message = 'Failed to promote'
    });
  }
}
