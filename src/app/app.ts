import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from './core/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Klemmbaustein-App</h1>
    <p>Backend: {{ status() }}</p>
  `,
})
export class App implements OnInit{
    private api = inject(ApiService);
  status = signal('wird geprüft…');

  ngOnInit() {
    this.api.get<{ status: string }>('/health').subscribe({
      next: (res) => this.status.set(res.status),
      error: () => this.status.set('nicht erreichbar'),
    });
  }
}
