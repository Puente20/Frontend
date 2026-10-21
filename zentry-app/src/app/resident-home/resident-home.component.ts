import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PanicButtonComponent } from '../panic-button/panic-button.component';
import { MOVIMIENTOS_RESERVA_STORAGE_KEY } from '../nueva-reserva/nueva-reserva.component';

interface ResidentRequest {
  user: {
    first_name: string;
  };
}

export interface MovimientoResidente {
  id: number;
  hora: string;
  fechaRegistro: string;
  tipo: 'reserva' | 'visitante-aprobado' | 'visitante-rechazado';
  descripcion: string;
  ubicacion: string;
  detalle: string;
}

@Component({
  selector: 'app-resident-home',
  standalone: true,
  imports: [CommonModule, PanicButtonComponent],
  templateUrl: './resident-home.component.html',
  styleUrl: './resident-home.component.css'
})
export class ResidentHomeComponent implements OnInit {
  request: ResidentRequest = {
    user: {
      first_name: 'Tomás'
    }
  };

  mostrarModalPanico: boolean = false;

  /** Lista reactiva que se muestra en la sección "Últimos movimientos" */
  ultimosMovimientos: MovimientoResidente[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarUltimosMovimientos();
  }

  cargarUltimosMovimientos(): void {
    const movimientosGuardados = this.obtenerMovimientosGuardados();
    const movimientosIniciales = this.crearMovimientosIniciales();
    this.ultimosMovimientos = [...movimientosGuardados, ...movimientosIniciales]
      .sort((a, b) => Date.parse(b.fechaRegistro) - Date.parse(a.fechaRegistro));
  }

  private obtenerMovimientosGuardados(): MovimientoResidente[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const guardados = window.localStorage.getItem(MOVIMIENTOS_RESERVA_STORAGE_KEY);
    if (!guardados) {
      return [];
    }

    const parseados: unknown = JSON.parse(guardados);
    if (!Array.isArray(parseados)) {
      return [];
    }

    return parseados.flatMap((valor: unknown): MovimientoResidente[] => {
      if (typeof valor !== 'object' || valor === null) {
        return [];
      }

      const movimiento = valor as Record<string, unknown>;
      if (
        typeof movimiento['id'] !== 'number' ||
        typeof movimiento['hora'] !== 'string' ||
        typeof movimiento['descripcion'] !== 'string' ||
        typeof movimiento['ubicacion'] !== 'string' ||
        typeof movimiento['detalle'] !== 'string'
      ) {
        return [];
      }

      const fechaRegistro = movimiento['fechaRegistro'];
      return [{
        id: movimiento['id'],
        hora: movimiento['hora'],
        fechaRegistro: typeof fechaRegistro === 'string' && !Number.isNaN(Date.parse(fechaRegistro))
          ? fechaRegistro
          : new Date(0).toISOString(),
        tipo: 'reserva',
        descripcion: movimiento['descripcion'],
        ubicacion: movimiento['ubicacion'],
        detalle: movimiento['detalle']
      }];
    });
  }

  private crearMovimientosIniciales(): MovimientoResidente[] {
    return [
      this.crearMovimientoInicial(1, 2, 'visitante-aprobado', 'Visitante aprobado', 'Patente: AG 122 OH'),
      this.crearMovimientoInicial(2, 8, 'reserva', 'Cancha de Pádel reservada', 'Fecha: 06/12/2028 · 18:00'),
      this.crearMovimientoInicial(3, 14, 'visitante-rechazado', 'Visitante rechazado', 'Patente: AC 431 DK'),
      this.crearMovimientoInicial(4, 24, 'reserva', 'SUM reservado', 'Fecha: 05/12/2028'),
      this.crearMovimientoInicial(5, 48, 'reserva', 'Cancha de Tenis reservada', 'Fecha: 04/12/2028 · 17:00'),
      this.crearMovimientoInicial(6, 72, 'reserva', 'Cancha de Fútbol 5 reservada', 'Fecha: 03/12/2028 · 19:00')
    ];
  }

  private crearMovimientoInicial(
    id: number,
    horasAtras: number,
    tipo: MovimientoResidente['tipo'],
    descripcion: string,
    detalle: string
  ): MovimientoResidente {
    const fechaRegistro = new Date(Date.now() - horasAtras * 60 * 60 * 1000);
    return {
      id,
      hora: `${String(fechaRegistro.getHours()).padStart(2, '0')}:${String(fechaRegistro.getMinutes()).padStart(2, '0')}`,
      fechaRegistro: fechaRegistro.toISOString(),
      tipo,
      descripcion,
      ubicacion: 'Lote 1',
      detalle
    };
  }

  trackByMovimientoId(_index: number, item: MovimientoResidente): number {
    return item.id;
  }

  irAQr(): void {
    void this.router.navigate(['/generar-qr']);
  }

  IrAPanic(): void {
    this.mostrarModalPanico = true;
  }

  cerrarModalPanico(): void {
    this.mostrarModalPanico = false;
  }

  confirmarEmergencia(): void {
    this.mostrarModalPanico = false;
  }

  IrANuevaReserva(): void {
    void this.router.navigate(['/nueva-reserva']);
  }
}