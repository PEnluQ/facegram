// core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

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
    console.log('Токен сохранён', token, 'роль:', role);
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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
      error: err => console.error('Ошибка обновления токена', err)
    });
  }
}
