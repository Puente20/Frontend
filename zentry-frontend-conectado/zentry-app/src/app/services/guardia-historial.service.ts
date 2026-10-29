import { Injectable } from '@angular/core';

export type TipoMovimientoGuardia = 'ingreso' | 'egreso';

export interface MovimientoGuardia {
  id: number;
  tipo: TipoMovimientoGuardia;
  nombre: string;
  dni: string;
  fechaRegistro: string;
}

const HISTORIAL_GUARDIA_STORAGE_KEY = 'zentry_historial_guardia';

@Injectable({ providedIn: 'root' })
export class GuardiaHistorialService {
  listar(): MovimientoGuardia[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const guardado = window.localStorage.getItem(HISTORIAL_GUARDIA_STORAGE_KEY);
      if (!guardado) {
        return [];
      }

      const movimientos: unknown = JSON.parse(guardado);
      if (!Array.isArray(movimientos)) {
        throw new Error('El historial guardado no tiene el formato esperado.');
      }

      return movimientos.filter((movimiento: unknown): movimiento is MovimientoGuardia => {
        if (typeof movimiento !== 'object' || movimiento === null) {
          return false;
        }

        const registro = movimiento as Record<string, unknown>;
        return typeof registro['id'] === 'number'
          && (registro['tipo'] === 'ingreso' || registro['tipo'] === 'egreso')
          && typeof registro['nombre'] === 'string'
          && typeof registro['dni'] === 'string'
          && typeof registro['fechaRegistro'] === 'string'
          && !Number.isNaN(Date.parse(registro['fechaRegistro']));
      }).sort((a, b) => Date.parse(b.fechaRegistro) - Date.parse(a.fechaRegistro));
    } catch (error: unknown) {
      console.error('No se pudo leer el historial de ingresos y egresos:', error);
      return [];
    }
  }

  registrarIngreso(nombre: string, dni: string): void {
    this.guardarMovimiento('ingreso', nombre, dni);
  }

  registrarEgresos(dnis: string[]): void {
    const movimientos = this.listar();
    const fechaBase = Date.now();
    const nuevosMovimientos = dnis.map((dni, index): MovimientoGuardia => ({
      id: fechaBase + index,
      tipo: 'egreso',
      nombre: this.buscarNombre(movimientos, dni),
      dni,
      fechaRegistro: new Date(fechaBase + index).toISOString()
    }));

    this.guardarTodos([...nuevosMovimientos, ...movimientos]);
  }

  obtenerNombrePorDni(dni: string): string {
    return this.buscarNombre(this.listar(), dni.trim());
  }

  private guardarMovimiento(tipo: TipoMovimientoGuardia, nombre: string, dni: string): void {
    const ahora = Date.now();
    this.guardarTodos([{
      id: ahora,
      tipo,
      nombre: nombre.trim(),
      dni: dni.trim(),
      fechaRegistro: new Date(ahora).toISOString()
    }, ...this.listar()]);
  }

  private guardarTodos(movimientos: MovimientoGuardia[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(HISTORIAL_GUARDIA_STORAGE_KEY, JSON.stringify(movimientos));
    } catch (error: unknown) {
      console.error('No se pudo guardar el historial de ingresos y egresos:', error);
    }
  }

  private buscarNombre(movimientos: MovimientoGuardia[], dni: string): string {
    return movimientos.find((movimiento) => movimiento.dni === dni && movimiento.nombre)?.nombre ?? '';
  }
}
