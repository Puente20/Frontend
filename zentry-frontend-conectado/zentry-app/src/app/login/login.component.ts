import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
  errorMensaje: string = '';
  enviando: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {}

  cambiarRol(rol: 'residente' | 'administrador' | 'guardia'): void {
    this.rolSeleccionado = rol;
    this.errorMensaje = '';
  }

  limpiarError(): void {
    this.errorMensaje = '';
  }

  ojoContra(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion(): void {
    if (!this.identificador.trim() || !this.password.trim()) {
      this.errorMensaje = 'Ingresá tu email y contraseña para continuar.';
      return;
    }

    this.errorMensaje = '';
    this.enviando = true;
    this.authService.logout();
    this.authService.login(this.identificador, this.password, this.rolSeleccionado).pipe(
      finalize(() => {
        this.enviando = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.redirigirSegunRol();
      },
      error: (err) => {
        this.authService.logout();
        this.errorMensaje = err.status === 401
          ? 'La información de inicio de sesión es incorrecta'
          : err.error?.detail
            || (err.status === 0
              ? 'No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.'
              : 'No se pudo iniciar sesión. Intentá nuevamente.');
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
