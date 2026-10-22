import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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

  enviarSolicitud(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.mensaje = 'El formulario está listo, pero falta conectarlo al servicio de recuperación.';
  }
}
