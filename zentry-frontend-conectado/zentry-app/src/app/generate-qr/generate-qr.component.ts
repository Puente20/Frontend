import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvitacionService } from '../invitaciones-activas/invitacion.service';

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
  generando = false;

  constructor(private router: Router, private invitacionService: InvitacionService) {}

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
    if (this.generando) {
      return;
    }

    if (!this.invitacion.nombreVisitante.trim() || !this.invitacion.dni.trim() || !this.invitacion.porton.trim()) {
      alert('Por favor, completa todos los campos de la invitación.');
      return;
    }

    this.mensajeError = '';
    this.generando = true;
    const nuevaInvitacion = {
      tipo: this.tipoInvitacion,
      ...this.invitacion
    };

    this.invitacionService.guardarEnBackend(nuevaInvitacion).subscribe({
      next: () => {
        void this.router.navigate(['/invitaciones-activas']);
      },
      error: (error: unknown) => {
        console.error('No se pudo crear la invitación en el backend:', error);
        this.generando = false;
        this.mensajeError = 'No se pudo crear la invitación. Verificá la conexión con el servidor e intentá nuevamente.';
      }
    });
  }
}