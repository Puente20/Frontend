import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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

    console.log('Generando QR con datos:', {
      tipo: this.tipoInvitacion,
      ...this.invitacion
    });
  }
}