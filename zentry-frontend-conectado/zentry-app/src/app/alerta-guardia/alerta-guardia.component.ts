import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  catchError,
  EMPTY,
  exhaustMap,
  interval,
  startWith,
  Subscription
} from 'rxjs';

import {
  AlertaEmergencia,
  EmergenciasService
} from '../services/emergencias.service';

@Component({
  selector: 'app-alerta-guardia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-guardia.component.html',
  styleUrl: './alerta-guardia.component.css'
})
export class AlertaGuardiaComponent implements OnInit, OnDestroy {

  alerta: AlertaEmergencia | null = null;

  resultado = '';
  error = '';
  enviando = false;
  sinConexion = false;

  private pendientes: AlertaEmergencia[] = [];
  private subscripcion?: Subscription;

  constructor(
    private emergencias: EmergenciasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.subscripcion = interval(3000).pipe(
      startWith(0),

      exhaustMap(() =>
        this.emergencias.pendientes().pipe(
          catchError(() => {
            this.sinConexion = true;
            this.cdr.markForCheck();
            return EMPTY;
          })
        )
      )

    ).subscribe(res => {

      this.sinConexion = false;
      this.pendientes = res.alertas;

      // No cambiar la alerta mientras se procesa una decisión
      // o mientras se muestra el mensaje de confirmación.
      if (this.resultado || this.enviando) {
        this.cdr.markForCheck();
        return;
      }

      // Mantener visible la emergencia actual.
      if (
        this.alerta &&
        res.alertas.some(a => a.id === this.alerta?.id)
      ) {
        this.cdr.markForCheck();
        return;
      }

      // Mostrar la primera emergencia pendiente.
      this.alerta = res.alertas[0] ?? null;
      this.error = '';

      // IMPORTANTE:
      // Avisar a Angular que llegaron datos nuevos.
      this.cdr.markForCheck();

    });
  }

  resolver(accion: 'enviar_movil' | 'rechazar'): void {

    if (!this.alerta || this.enviando) {
      return;
    }

    const id = this.alerta.id;

    this.enviando = true;
    this.error = '';

    this.cdr.markForCheck();

    this.emergencias.resolver(id, accion).subscribe({

      next: () => {

        this.enviando = false;
        this.alerta = null;

        this.pendientes = this.pendientes.filter(
          a => a.id !== id
        );

        if (accion === 'enviar_movil') {
          this.resultado = 'Emergencia atendida';
        } else {
          this.resultado = 'Emergencia rechazada';
        }

        this.cdr.markForCheck();
      },

      error: err => {

        this.enviando = false;

        this.error = err.status === 409
          ? 'La emergencia ya fue resuelta por otro guardia.'
          : 'No se pudo registrar la decisión. Intentá nuevamente.';

        this.cdr.markForCheck();
      }

    });
  }

  cerrarResultado(): void {

    this.resultado = '';
    this.alerta = this.pendientes[0] ?? null;
    this.error = '';

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscripcion?.unsubscribe();
  }
}