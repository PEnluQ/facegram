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
  private clientExpireTimer: any = null;
  private clientExpireAt: number | null = null;

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
    this.startNotificationListener();
    if (role === 'CLIENT') {
      try {
        const payload: any = jwtDecode(token);
        const exp = payload.exp ? Number(payload.exp) : null;
        if (exp) {
          this.scheduleClientExpiration(exp);
        }
      } catch {}
    } else {
      if (this.clientExpireTimer) {
        clearTimeout(this.clientExpireTimer);
        this.clientExpireTimer = null;
      }
      this.clientExpireAt = null;
    }
  }

  resumeClientInvite() {
    const role = this.getRole();
    if (role !== 'CLIENT') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload: any = jwtDecode(token);
      const exp = payload.exp ? Number(payload.exp) : null;
      if (exp) {
        this.scheduleClientExpiration(exp);
      }
    } catch {}
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
    if (this.clientExpireTimer) {
      clearTimeout(this.clientExpireTimer);
      this.clientExpireTimer = null;
    }
    this.clientExpireAt = null;
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
      const role = payload.role;
      if (role === 'ADMIN' || role === 'WAGESLAVE') {
        return true;
      }
      if (role === 'CLIENT') {
        const exp = payload.exp ? Number(payload.exp) : null;
        return !!exp && Date.now() / 1000 < exp;
      }
      return false;
    } catch {
      return false;
    }
  }

  acceptInvite(invite: string) {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return this.http.post<{ token: string; role: string }>(
      `${this.api}/invite/accept?token=${invite}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

    createInvite()  {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return this.http.post(
      `${this.api}/invite/create`,
      {},
      { responseType: 'text', headers: { Authorization: `Bearer ${token}` } }
    );
  }

  refreshToken() {
    const role = this.getRole();
    if (role === 'CLIENT') {
      return;
    }
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
    const role = this.getRole();
    if (role === 'CLIENT') {
      this.refreshTimerId = null;
      return;
    }
    this.refreshTimerId = setInterval(() => this.refreshToken(), 600000);
  }

  private startNotificationListener() {
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
    this.eventSource.addEventListener('role', () => {
      this.refreshToken();
      const role = this.getRole();
      if (role === 'GUEST') {
        this.router.navigate(['/']);
      }
    });
    this.eventSource.onerror = () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      setTimeout(() => this.startNotificationListener(), 5000);
    };
  }

  private scheduleClientExpiration(exp: number) {
    if (this.clientExpireTimer) {
      clearTimeout(this.clientExpireTimer);
    }
    this.clientExpireAt = exp * 1000;
    const delay = exp * 1000 - Date.now();
    if (delay <= 0) {
      this.logout();
      this.router.navigate(['/']);
      return;
    }
    this.clientExpireTimer = setTimeout(() => {
      this.logout();
      this.router.navigate(['/']);
    }, delay);
  }

  getClientRemainingSeconds(): number | null {
    if (!this.clientExpireAt) return null;
    const remaining = Math.floor((this.clientExpireAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : null;
  }
}
