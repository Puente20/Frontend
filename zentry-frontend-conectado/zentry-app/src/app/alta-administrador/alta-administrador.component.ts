import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, finalize } from 'rxjs';
import { AdministradoresService } from '../services/administradores.service';

@Component({
  selector: 'app-alta-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './alta-administrador.component.html',
  styleUrl: './alta-administrador.component.css'
})
export class AltaAdministradorComponent {
  adminNombre = 'Valentina Canepa';
  adminRol = 'Administradora';

  administrador = {
    nombre: '',
    dni: '',
    mail: '',
    contra: ''
  };

  readonly mensajeFormulario = signal('');
  readonly tipoMensaje = signal<'error' | 'info' | ''>('');
  readonly guardando = signal(false);

  constructor(
    private router: Router,
    private administradoresService: AdministradoresService
  ) {}

  cancelar(): void {
    void this.router.navigate(['/admin-home']);
  }

  darAlta(): void {
    if (this.guardando()) {
      return;
    }

    const nombre = this.administrador.nombre.trim();
    const dni = this.administrador.dni.trim();
    const mail = this.administrador.mail.trim();
    const contra = this.administrador.contra;

    if (!nombre || !dni || !mail || !contra.trim()) {
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

    this.guardando.set(true);
    this.mensajeFormulario.set('');
    this.tipoMensaje.set('');

    this.administradoresService.crearAdministrador({
      nombre,
      dni,
      email: mail,
      password: contra
    }).pipe(
      finalize(() => {
        this.guardando.set(false);
      })
    ).subscribe({
      next: () => {
        this.administrador = { nombre: '', dni: '', mail: '', contra: '' };
        this.mostrarMensaje('Administrador registrado correctamente.', 'info');
      },
      error: (error: unknown) => {
        const mensaje = error instanceof TimeoutError
          ? 'El servidor no confirmó el alta en 15 segundos. Verificá si el administrador se creó antes de volver a intentarlo.'
          : this.obtenerMensajeError(error);
        this.mostrarMensaje(mensaje, 'error');
      }
    });
  }

  private obtenerMensajeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo confirmar el alta del administrador. Verificá si se creó antes de volver a intentarlo.';
    }

    if (error.status === 401) {
      return 'Tu sesión no es válida o expiró. Iniciá sesión con una cuenta administradora activa.';
    }

    if (error.status === 403) {
      return 'Solo una cuenta administradora activa puede registrar otro administrador.';
    }

    const cuerpo: unknown = error.error;

    if (typeof cuerpo === 'string') {
      return cuerpo;
    }

    if (typeof cuerpo === 'object' && cuerpo !== null) {
      const mensajes = Object.entries(cuerpo).flatMap(([campo, valor]) => {
        const valores = Array.isArray(valor) ? valor : [valor];
        return valores
          .filter((mensaje): mensaje is string => typeof mensaje === 'string')
          .map((mensaje) => `${campo}: ${mensaje}`);
      });
      if (mensajes.length) {
        return mensajes.join(' ');
      }
    }

    return 'No se pudo registrar el administrador. Revisá los datos e intentá de nuevo.';
  }

  private mostrarMensaje(mensaje: string, tipo: 'error' | 'info'): void {
    this.mensajeFormulario.set(mensaje);
    this.tipoMensaje.set(tipo);
  }
}
