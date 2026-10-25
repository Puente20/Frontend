import { CommonModule } from '@angular/common';
import { afterNextRender, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Invitacion, InvitacionStorageService } from './invitacion-storage.service';

@Component({
  selector: 'app-invitaciones-activas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitaciones-activas.component.html',
  styleUrl: './invitaciones-activas.component.css'
})
export class InvitacionesActivasComponent {
  readonly socioNombre = 'Tomás';
  readonly nombreBarrio = 'Los cardales';
  readonly fechaActual = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  readonly invitaciones = signal<Invitacion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly invitacionAEliminar = signal<Invitacion | null>(null);

  constructor(
    private readonly router: Router,
    private readonly invitacionStorage: InvitacionStorageService
  ) {
    afterNextRender(() => this.cargarInvitaciones());
  }

  cargarInvitaciones(): void {
    this.cargando.set(true);
    this.error.set('');
    this.invitacionStorage.listarActivasApi().subscribe({
      next: (datos) => {
        this.invitaciones.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        try {
          this.invitaciones.set(this.invitacionStorage.listarActivas());
        } catch (error: unknown) {
          this.error.set(error instanceof Error
            ? error.message
            : 'No se pudieron cargar las invitaciones.');
        } finally {
          this.cargando.set(false);
        }
      }
    });
  }

  confirmarEliminacion(invitacion: Invitacion): void {
    this.invitacionAEliminar.set(invitacion);
  }

  cancelarEliminacion(): void {
    this.invitacionAEliminar.set(null);
  }

  ejecutarEliminacion(): void {
    const invitacion = this.invitacionAEliminar();
    if (!invitacion) {
      return;
    }

    this.error.set('');
    this.invitacionStorage.eliminarEnBackend(invitacion.id).subscribe({
      next: () => {
        this.invitacionAEliminar.set(null);
        this.cargarInvitaciones();
      },
      error: () => {
        try {
          this.invitacionStorage.eliminar(invitacion.id);
          this.invitacionAEliminar.set(null);
          this.cargarInvitaciones();
        } catch (error: unknown) {
          this.error.set(error instanceof Error
            ? error.message
            : 'No se pudo eliminar la invitación.');
        }
      }
    });
  }

  formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(anio, mes - 1, dia));
  }

  volver(): void {
    void this.router.navigate(['/resident-home']);
  }
}