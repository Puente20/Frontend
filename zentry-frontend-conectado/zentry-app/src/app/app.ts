import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AlertaGuardiaComponent } from './alerta-guardia/alerta-guardia.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AlertaGuardiaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'zentry-app';

  constructor(private auth: AuthService) {}

  esGuardia(): boolean {
    return this.auth.obtenerUsuarioActual()?.rol === 'guardia';
  }
}
