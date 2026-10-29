import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, finalize } from 'rxjs';
import { GuardiasService } from '../services/guardias.service';

@Component({
  selector: 'app-registrar-guardia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-guardia.component.html',
  styleUrl: './registrar-guardia.component.css'
})
export class RegistrarGuardiaComponent {
  adminNombre = 'Valentina Canepa';
  adminRol = 'Administradora';

  guardia = {
    nombre: '',
    mail: '',
    contra: ''
  };

  mensajeFormulario = '';
  tipoMensaje: 'error' | 'info' | '' = '';
  guardando = false;

  constructor(
    private router: Router,
    private guardiasService: GuardiasService
  ) {}

  cancelar(): void {
    void this.router.navigate(['/admin-home']);
  }

  darAlta(): void {
    if (this.guardando) {
      return;
    }

    const nombre = this.guardia.nombre.trim();
    const mail = this.guardia.mail.trim();
    const contra = this.guardia.contra;

    if (!nombre || !mail || !contra.trim()) {
      this.mostrarMensaje('Completá todos los campos para continuar.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      this.mostrarMensaje('Ingresá una dirección de correo válida.', 'error');
      return;
    }

    if (contra.length < 8) {
      this.mostrarMensaje('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    this.guardando = true;
    this.mensajeFormulario = '';
    this.tipoMensaje = '';

    this.guardiasService.crearGuardia({
      nombre,
      email: mail,
      password: contra
    }).pipe(
      finalize(() => {
        this.guardando = false;
      })
    ).subscribe({
      next: () => {
        this.guardia = { nombre: '', mail: '', contra: '' };
        this.mostrarMensaje('Guardia registrado correctamente.', 'info');
      },
      error: (error: HttpErrorResponse) => {
        const mensaje = error instanceof TimeoutError
          ? 'El servidor no respondió en 15 segundos. Revisá que el backend esté funcionando e intentá de nuevo.'
          : this.obtenerMensajeError(error);
        this.mostrarMensaje(mensaje, 'error');
      }
    });
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    const cuerpo: unknown = error.error;

    if (typeof cuerpo === 'string') {
      return cuerpo;
    }

    if (typeof cuerpo === 'object' && cuerpo !== null) {
      const valores = Object.values(cuerpo).flatMap((valor) =>
        Array.isArray(valor) ? valor : [valor]
      );
      const mensajes = valores.filter((valor): valor is string => typeof valor === 'string');
      if (mensajes.length) {
        return mensajes.join(' ');
      }
    }

    return 'No se pudo registrar el guardia. Revisá los datos e intentá de nuevo.';
  }

  private mostrarMensaje(mensaje: string, tipo: 'error' | 'info'): void {
    this.mensajeFormulario = mensaje;
    this.tipoMensaje = tipo;
  }
}
