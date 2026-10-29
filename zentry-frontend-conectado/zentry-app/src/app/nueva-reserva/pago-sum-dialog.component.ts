import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedioPagoSum } from '../services/simulador-pago.service';

@Component({
  selector: 'app-pago-sum-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago-sum-dialog.component.html',
  styleUrl: './pago-sum-dialog.component.css'
})
export class PagoSumDialogComponent {
  @Input() monto = 0;
  @Input() medioPagoSeleccionado: MedioPagoSum = 'saldo';
  @Input() procesando = false;
  @Input() mensajeError = '';

  @Output() readonly medioPagoSeleccionadoChange = new EventEmitter<MedioPagoSum>();
  @Output() readonly confirmarPago = new EventEmitter<void>();
  @Output() readonly cancelarPago = new EventEmitter<void>();

  get montoFormateado(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(this.monto);
  }
}
