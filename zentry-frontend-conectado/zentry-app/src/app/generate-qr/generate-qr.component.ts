import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvitacionStorageService } from '../invitaciones-activas/invitacion-storage.service';

@Component({
  selector: 'app-generate-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-qr.component.html',
  styleUrl: './generate-qr.component.css'
})
export class GenerateQrComponent {
  fechaActual: string = '13 de Agosto de 2026';
  tipoInvitacion: 'unica' | 'concurrente' = 'unica';
  private navigationTimer?: ReturnType<typeof setTimeout>;

  invitacion = {
    nombreVisitante: '',
    dni: '',
    porton: ''
  };

  mensajeError = '';

  constructor(private router: Router, private invitacionStorage: InvitacionStorageService) {}

  seleccionarTipo(tipo: 'unica' | 'concurrente'): void {
    if (tipo === 'concurrente') {
      this.tipoInvitacion = tipo;
      this.navegarLuego('/generar-qr-concurrente');
      return;
    }

    this.tipoInvitacion = tipo;
  }

  private navegarLuego(ruta: string): void {
    clearTimeout(this.navigationTimer);
    this.navigationTimer = setTimeout(() => {
      void this.router.navigate([ruta]);
    }, 400);
  }

  volver(): void {
    this.router.navigate(['/resident-home']);
  }

  generarQR(): void {
    if (!this.invitacion.nombreVisitante.trim() || !this.invitacion.dni.trim() || !this.invitacion.porton.trim()) {
      alert('Por favor, completa todos los campos de la invitación.');
      return;
    }

    this.mensajeError = '';
    const nuevaInvitacion = {
      tipo: this.tipoInvitacion,
      ...this.invitacion
    };

    this.invitacionStorage.guardarEnBackend(nuevaInvitacion).subscribe({
      next: () => {
        void this.router.navigate(['/invitaciones-activas']);
      },
      error: () => {
        try {
          this.invitacionStorage.guardar(nuevaInvitacion);
          void this.router.navigate(['/invitaciones-activas']);
        } catch (error: unknown) {
          this.mensajeError = error instanceof Error
            ? error.message
            : 'No se pudo guardar la invitación.';
        }
      }
    });
  }
}