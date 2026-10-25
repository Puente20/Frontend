import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  rolSeleccionado: 'residente' | 'administrador' | 'guardia' = 'administrador';
  identificador: string = '';
  password: string = '';
  mostrarPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  cambiarRol(rol: 'residente' | 'administrador' | 'guardia'): void {
    this.rolSeleccionado = rol;
  }

  ojoContra(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion(): void {
    this.authService.login(this.identificador, this.password, this.rolSeleccionado).subscribe({
      next: () => this.redirigirSegunRol(),
      error: (err) => {
        console.warn('Backend no disponible o error en login, redirigiendo en modo local:', err);
        this.redirigirSegunRol();
      }
    });
  }

  private redirigirSegunRol(): void {
    if (this.rolSeleccionado === 'administrador') {
      void this.router.navigate(['/admin-home']);
    } else if (this.rolSeleccionado === 'residente') {
      void this.router.navigate(['/resident-home']);
    } else if (this.rolSeleccionado === 'guardia') {
      void this.router.navigate(['/guardia-home']);
    }
  }
}
