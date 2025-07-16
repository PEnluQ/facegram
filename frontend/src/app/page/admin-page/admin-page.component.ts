import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { Router } from '@angular/router';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  template: `
    <div class="content-wrapper">
      <p-autoComplete [(ngModel)]="query" [suggestions]="results" field="username"
                      (completeMethod)="search($event)" (onSelect)="select($event)" [forceSelection]="true">
        <ng-template pTemplate="item" let-user>
          <div class="flex justify-between">
            <span>{{ user.username }}</span>
            <span class="ml-2 text-sm">{{ user.role }}</span>
          </div>
        </ng-template>
      </p-autoComplete>
    </div>
  `,
  styles: [`
    .content-wrapper {
      padding: 1rem;
    }
  `]
})
export class AdminPageComponent {
  query = '';
  results: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  search(event: any) {
    const q = event.query.trim();
    if (!q) { this.results = []; return; }
    this.http.get<any[]>(`${environment.apiUrl}/admin/users?q=${q}`).subscribe({
      next: (users) => this.results = users,
      error: () => this.results = []
    });
  }

  select(event: any) {
    const user = event.value ?? event;
    if (!user || user.telegramId == null) return;
    this.router.navigate(['/admin/user', user.telegramId]);
  }
}
