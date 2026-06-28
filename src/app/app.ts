import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from './core/services/api.service';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, Header],
})
export class App {
  title = 'Bricks';
}
