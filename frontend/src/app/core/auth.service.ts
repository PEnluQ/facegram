// core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private refreshTimerId: any = null;
  private eventSource: EventSource | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  loginViaTelegram(initData: string) {
    console.log('Angular отправляет запрос на:', `${this.api}/auth/telegram`, { initData });
    return this.http.post<{ token: string; role: string }>(
      `${this.api}/auth/telegram`,
      { initData }
    );
  }

  saveAuth(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.removeItem('blocked');
    console.log('Токен сохранён', token, 'роль:', role);
    this.startAutoRefresh();
    this.startBlockListener();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload: any = jwtDecode(token);
      return payload.role || null;
    } catch {
      return null;
    }
  }

  logout(blocked = false) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (blocked) {
      localStorage.setItem('blocked', 'true');
    } else {
      localStorage.removeItem('blocked');
    }
  }

  isBlocked(): boolean {
    return localStorage.getItem('blocked') === 'true';
  }

  isChatAllowed(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload: any = jwtDecode(token);
      return payload.role === 'GUEST' && (payload.exp * 1000) > Date.now();
    } catch {
      return false;
    }
  }

  refreshToken() {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.http.post<{ token: string; role: string }>(`${this.api}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => this.saveAuth(res.token, res.role),
      error: err => {
        console.error('Ошибка обновления токена', err);
        if (err.status === 403) {
          this.logout(true);
          this.router.navigate(['/blocked']);
        }
      }
    });
  }

  private startAutoRefresh() {
    if (this.refreshTimerId) {
      clearInterval(this.refreshTimerId);
    }
    this.refreshTimerId = setInterval(() => this.refreshToken(), 60 * 1000);
  }

  private startBlockListener() {
    if (this.eventSource) {
      this.eventSource.close();
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    this.eventSource = new EventSource(`${this.api}/notifications/subscribe?token=${token}`);
    this.eventSource.addEventListener('blocked', (e: MessageEvent) => {
      const blocked = e.data === 'true';
      if (blocked) {
        this.logout(true);
        this.router.navigate(['/blocked']);
      }
    });
    this.eventSource.onerror = () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      setTimeout(() => this.startBlockListener(), 5000);
    };
  }
}
