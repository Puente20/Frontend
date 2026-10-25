import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-recu-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recu-contrasena.component.html',
  styleUrl: './recu-contrasena.component.css'
})
export class RecuContrasenaComponent {
  correo = '';
  mensaje = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  enviarSolicitud(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.authService.recuperarContrasena(this.correo).subscribe({
      next: () => void this.router.navigate(['/confirmarRecu']),
      error: () => void this.router.navigate(['/confirmarRecu'])
    });
  }

  volveraAtras(): void {
    void this.router.navigate(['/login']);
  }
}
