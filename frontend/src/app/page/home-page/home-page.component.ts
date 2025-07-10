import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { AsyncPipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';

import { RoomService, Room } from '../../core/room.service';
import { Card } from 'primeng/card';

@Component({
  selector: 'home-page-component',
  imports: [
    ButtonDirective,
    Card,
    AsyncPipe,
    FormsModule,
    NgForOf,
    RouterLink,
  ],
  template: `
    <ng-container>
      <p-card header="Добро пожаловать!">
        <p>Здесь ваш основной контент на домашней странице.</p>
        <button pButton label="Подробнее" icon="pi pi-info-circle"></button>
      </p-card>
      <input [(ngModel)]="newTitle" placeholder="Room title" />
      <button (click)="createRoom()">Create</button>
      <ul>
        <li *ngFor="let r of rooms$ | async">
          <a [routerLink]="['/chat', r.id]">
            {{ r.title }}
          </a>
      </ul>
    </ng-container>
  `
})

export class HomePageComponent implements OnInit {
  rooms$!: Observable<Room[]>;
  newTitle = '';

  constructor(
    public router: Router,
    private roomSvc: RoomService
  ) {}

  ngOnInit(): void {
    this.rooms$ = this.roomSvc.list$();
  }

  createRoom(): void {
    const title = this.newTitle.trim();
    if (!title) return;

    const room = this.roomSvc.create(title);
    this.newTitle = '';

    this.router.navigate(['/chat', room.id]);
  }
}
