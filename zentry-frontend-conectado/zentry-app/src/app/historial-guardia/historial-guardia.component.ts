import { Component, OnInit } from '@angular/core';
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

  constructor(
    private router: Router,
    private historialService: GuardiaHistorialService
  ) {}

  ngOnInit(): void {
    this.movimientos = this.historialService.listar();
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
