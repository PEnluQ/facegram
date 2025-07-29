import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Card } from 'primeng/card';

@Component({
  selector: 'home-page-component',
  imports: [
    Card,
  ],
  template: `
    <ng-container>
      <p-card header="Добро пожаловать!">
        <p>Здесь ваш основной контент на домашней странице.</p>
      </p-card>
    </ng-container>
  `
})

export class HomePageComponent {
  constructor(public router: Router) {}
}
