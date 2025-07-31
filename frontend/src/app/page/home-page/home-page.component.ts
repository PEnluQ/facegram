import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'home-page-component',
  imports: [
    ButtonDirective,
    Card,
  ],
  template: `
    <ng-container>
      <p-card header="Добро пожаловать!">
        <p>Здесь ваш основной контент на домашней странице.</p>
        <button pButton label="Подробнее" icon="pi pi-info-circle"></button>
      </p-card>
    </ng-container>
  `
})

export class HomePageComponent {
  constructor(public router: Router) {}
}
