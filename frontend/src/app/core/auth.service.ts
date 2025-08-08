import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private refreshTimerId: any = null;
  private eventSource: EventSource | null = null;
  private chatTokenKey = 'chat_room_token';

  constructor(private http: HttpClient, private router: Router, private zone: NgZone ) {
    if (this.isAuthenticated()) {
      this.startAutoRefresh();
      this.startNotificationListener();
    }
  }

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
    localStorage.removeItem(this.chatTokenKey);
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
      const role = payload.role;
      if (payload.invite) {
        return true;
      }
      return role === 'ADMIN' || role === 'WAGESLAVE';
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

  createInvite() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return this.http.post(
      `${this.api}/invite/create`,
      {},
      { responseType: 'text', headers: { Authorization: `Bearer ${token}` } }
    );
  }

  closeChat(token: string) {
    const auth = localStorage.getItem('token');
    if (!auth) return null;
    return this.http.post<void>(
      `${this.api}/invite/close/${token}`,
      {},
      { headers: { Authorization: `Bearer ${auth}` } }
    );
  }

  setChatRoomToken(token: string) {
    localStorage.setItem(this.chatTokenKey, token);
  }

  getChatRoomToken(): string | null {
    return localStorage.getItem(this.chatTokenKey);
  }

  clearChatRoomToken() {
    localStorage.removeItem(this.chatTokenKey);
  }

  getInviteInfo(token: string) {
    const auth = localStorage.getItem('token');
    if (!auth) return null;
    return this.http.get<{ author: string; guest: string }>(
      `${this.api}/invite/info/${token}`,
      { headers: { Authorization: `Bearer ${auth}` } }
    );
  }

  refreshToken() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      jwtDecode(token);
    } catch {}
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
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload: any = jwtDecode(token);
      if (payload.invite) {
        this.refreshTimerId = null;
        return;
      }
    } catch {}
    this.refreshTimerId = setInterval(() => this.refreshToken(), 600000);
  }

  private startNotificationListener() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log("was exist");
    }
    const token = localStorage.getItem('token');

    if (!token) return;
    console.log("has token");

    this.eventSource = new EventSource(
      `${this.api}/notifications/subscribe?token=${encodeURIComponent(token)}`
    );

    console.log("Начал слушать");

    this.eventSource.addEventListener('blocked', (e: MessageEvent) =>
      this.zone.run(() => {
        console.log(123)
        if (e.data === 'true') {
          this.logout(true);
          this.router.navigate(['/blocked']);
        }
      })
    );

    this.eventSource.addEventListener('chat_closed', () =>
      this.zone.run(() => {
        this.clearChatRoomToken();
        this.router.navigate(['/chat']);
      })
    );

    this.eventSource.addEventListener('role', () =>
      this.zone.run(() => {
        this.refreshToken();
        if (this.getRole() === 'GUEST') this.router.navigate(['/']);
      })
    );

    this.eventSource.onerror = () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      console.log("Переподключение будет");
      setTimeout(() => this.startNotificationListener(), 5000);
    };
  }

  // private startNotificationListener() {
  //   console.log("Начинается слушанье");
  //   if (this.eventSource) {
  //     this.eventSource.close();
  //   }
  //   const token = localStorage.getItem('token');
  //   if (!token) return;
  //
  //   this.eventSource = new EventSource(`${this.api}/notifications/subscribe?token=${token}`);
  //
  //   const handleBlocked = (e: MessageEvent) => {
  //     const blocked = e.data === 'true';
  //     if (blocked) {
  //       console.log("Блокировка");
  //       this.logout(true);
  //       this.router.navigate(['/blocked']);
  //     }
  //   };
  //
  //   this.eventSource.addEventListener('blocked', handleBlocked);
  //
  //   this.eventSource.addEventListener('role', () => {
  //     this.refreshToken();
  //     const role = this.getRole();
  //     if (role === 'GUEST') {
  //       this.router.navigate(['/']);
  //     }
  //   });
  //
  //   const handleChatClosed = () => {
  //       this.clearChatRoomToken();
  //       console.log("Чат закрыт");
  //       this.router.navigate(['/chat']);
  //   };
  //
  //   this.eventSource.addEventListener('chat_closed', handleChatClosed);
  //
  //   this.eventSource.onerror = () => {
  //     if (this.eventSource) {
  //       this.eventSource.close();
  //       this.eventSource = null;
  //     }
  //     setTimeout(() => this.startNotificationListener(), 5000);
  //   };
  // }
}
