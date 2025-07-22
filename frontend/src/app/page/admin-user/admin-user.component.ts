import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'admin-user',
  standalone: true,
  imports: [CommonModule, ButtonDirective],
  template: `
      <div class="content-wrapper">
        <button pButton icon="pi pi-arrow-left" class="p-button-text mb-3" (click)="goBack()"></button>
        <ng-container *ngIf="user">
      <h2>Username: {{ user.username }}</h2>
      <p>Role: {{ user.role }}</p>
      <p>Banned: {{user.blocked}}</p>
      <button *ngIf="user.role === 'GUEST'" pButton label="Promote to WAGESLAVE" (click)="promote()"></button>
      <button *ngIf="user.role === 'WAGESLAVE'" pButton label="Demote to GUEST" severity="danger" class="mr-3" (click)="demote()"></button>
      <button pButton label="{{ user.blocked ? 'Unblock' : 'Block' }}" severity="danger" class="ml-3" (click)="toggleBlock()"></button>
      <p *ngIf="message">{{ message }}</p>
        </ng-container>
    </div>
  `,
  styles: [`
    .content-wrapper { padding: 1rem; }
  `]
})

export class AdminUserComponent implements OnInit {
  user: any = null;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`${environment.apiUrl}/admin/users/${id}`).subscribe({
        next: (u) => this.user = u,
        error: () => this.router.navigate(['/admin'])
      });
    }
  }

  promote() {
    if (!this.user) return;
    this.http.post(
      `${environment.apiUrl}/admin/users/${this.user.telegramId}/wageslave`,
      {},
      { responseType: 'text' }
    ).subscribe({
      next: (res) => {
        this.message = res === 'already' ? 'Действие уже совершено' : 'Успешно';
        if (res !== 'already') this.user.role = 'WAGESLAVE';
        setTimeout(() => (this.message = ''), 3000);
      },
      error: () => {
        this.message = 'Failed';
        setTimeout(() => (this.message = ''), 3000);
      }
    });
  }

  demote() {
    if (!this.user) return;
    this.http.post(
      `${environment.apiUrl}/admin/users/${this.user.telegramId}/guest`,
      {},
      { responseType: 'text' }
    ).subscribe({
      next: (res) => {
        this.message = res === 'already' ? 'Действие уже совершено' : 'Успешно';
        if (res !== 'already') this.user.role = 'GUEST';
        setTimeout(() => (this.message = ''), 3000);
      },
      error: () => {
        this.message = 'Failed';
        setTimeout(() => (this.message = ''), 3000);
      }
    });
  }


  toggleBlock() {
    if (!this.user) return;
    const action = this.user.blocked ? 'unblock' : 'block';
    this.http.post(
      `${environment.apiUrl}/admin/users/${this.user.telegramId}/${action}`,
      {},
      { responseType: 'text' }
    ).subscribe({
      next: (res) => {
        this.message = res === 'already' ? 'Действие уже совершено' : 'Успешно';
        if (res !== 'already') this.user.blocked = action === 'block';
        setTimeout(() => (this.message = ''), 3000);
      },
      error: () => {
        this.message = 'Failed';
        setTimeout(() => (this.message = ''), 3000);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
