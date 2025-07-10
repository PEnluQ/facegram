import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Room { id: string; title: string; created: number; }

@Injectable({ providedIn: 'root' })

export class RoomService {
  private rooms$ = new BehaviorSubject<Room[]>([]);

  create(title: string) {
    const r: Room = { id: crypto.randomUUID(), title, created: Date.now() };
    this.rooms$.next([...this.rooms$.value, r]);
    return r;
  }

  list$() { return this.rooms$.asObservable(); }
}
