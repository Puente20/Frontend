import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  enviarSolicitud(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.router.navigate(['/confirmarRecu']);
  }

  volveraAtras(): void {
    this.router.navigate(['/login']);
  }
}
