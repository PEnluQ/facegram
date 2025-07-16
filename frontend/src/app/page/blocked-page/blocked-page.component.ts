import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'blocked-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-wrapper">
      <p>Вы заблокированы за нарушение правил использования сервиса.<br>Для выяснения пишите менеджеру.</p>
    </div>
  `,
  styles: [`
    .content-wrapper { padding: 1rem; text-align: center; }
  `]
})
export class BlockedPageComponent {}
