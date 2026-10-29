import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  GuardiaHistorialService,
  MovimientoGuardia,
  TipoMovimientoGuardia
} from '../services/guardia-historial.service';

@Component({
  selector: 'app-historial-guardia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-guardia.component.html',
  styleUrl: './historial-guardia.component.css'
})
export class HistorialGuardiaComponent implements OnInit {
  tipoActivo: TipoMovimientoGuardia = 'ingreso';
  movimientos: MovimientoGuardia[] = [];
  cargando = false;
  mensajeError = '';

  constructor(
    private router: Router,
    private historialService: GuardiaHistorialService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.historialService.getMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos = movimientos;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('No se pudo cargar el historial del guardia:', error);
        this.mensajeError = 'No se pudo cargar el historial. Revisá la conexión con el servidor e intentá nuevamente.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get movimientosFiltrados(): MovimientoGuardia[] {
    return this.movimientos.filter((movimiento) => movimiento.tipo === this.tipoActivo);
  }

  puedeRegistrarEgreso(movimiento: MovimientoGuardia): boolean {
    if (movimiento.tipo !== 'ingreso') {
      return false;
    }

    return !this.movimientos.some((otro) =>
      otro.dni === movimiento.dni
      && otro.tipo === 'egreso'
      && Date.parse(otro.fechaRegistro) > Date.parse(movimiento.fechaRegistro)
    );
  }

  mostrarFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(fecha));
  }

  registrarEgreso(movimiento: MovimientoGuardia): void {
    void this.router.navigate(['/registrar-egreso'], {
      queryParams: { dni: movimiento.dni }
    });
  }

  volver(): void {
    void this.router.navigate(['/guardia-home']);
  }
}
