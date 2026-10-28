import { CommonModule } from '@angular/common';
import { afterNextRender, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Invitacion, InvitacionService } from './invitacion.service';

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
  readonly errorQr = signal('');
  readonly imagenesQr = signal<Record<string, string>>({});
  readonly invitacionAEliminar = signal<Invitacion | null>(null);

  constructor(
    private readonly router: Router,
    private readonly invitacionService: InvitacionService
  ) {
    afterNextRender(() => this.cargarInvitaciones());
  }

  cargarInvitaciones(): void {
    this.cargando.set(true);
    this.error.set('');
    this.invitacionService.listarActivasApi().subscribe({
      next: (datos) => {
        this.invitaciones.set(datos);
        this.imagenesQr.set({});
        this.cargando.set(false);
        void this.generarImagenesQr(datos);
      },
      error: (error: unknown) => {
        console.error('No se pudieron cargar las invitaciones desde el backend:', error);
        this.error.set('No se pudieron cargar las invitaciones. Verificá la conexión con el servidor e intentá nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  private async generarImagenesQr(invitaciones: Invitacion[]): Promise<void> {
    this.errorQr.set('');
    const invitacionesConToken = invitaciones.filter(
      (invitacion): invitacion is Invitacion & { qrToken: string } =>
        typeof invitacion.qrToken === 'string' && invitacion.qrToken.length > 0
    );

    try {
      const { toDataURL } = await import('qrcode');
      const pares = await Promise.all(
        invitacionesConToken.map(async (invitacion) => [
          invitacion.id,
          await toDataURL(invitacion.qrToken, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 220
          })
        ] as const)
      );
      this.imagenesQr.set(Object.fromEntries(pares));
    } catch (error: unknown) {
      console.error('No se pudieron generar los códigos QR de las invitaciones:', error);
      this.errorQr.set('No se pudieron mostrar los códigos QR. Actualizá la pantalla para intentar nuevamente.');
    }
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
    this.invitacionService.eliminarEnBackend(invitacion.id).subscribe({
      next: () => {
        this.invitacionAEliminar.set(null);
        this.cargarInvitaciones();
      },
      error: (error: unknown) => {
        console.error('No se pudo eliminar la invitación en el backend:', error);
        this.error.set('No se pudo eliminar la invitación. Verificá la conexión con el servidor e intentá nuevamente.');
        this.invitacionAEliminar.set(null);
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