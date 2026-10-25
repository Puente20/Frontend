import { Injectable } from '@angular/core';

export interface MovimientoResidente {
  id: number;
  hora: string;
  fechaRegistro: string;
  tipo: 'reserva' | 'invitacion' | 'visitante-aprobado' | 'visitante-rechazado';
  descripcion: string;
  ubicacion: string;
  detalle: string;
}

export const MOVIMIENTOS_STORAGE_KEY = 'zentry_ultimos_movimientos';
const HISTORIAL_INICIALIZADO_KEY = 'zentry_ultimos_movimientos_inicializado';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  inicializarHistorial(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (window.localStorage.getItem(HISTORIAL_INICIALIZADO_KEY) === 'true') {
        return;
      }

      window.localStorage.removeItem(MOVIMIENTOS_STORAGE_KEY);
      window.localStorage.setItem(HISTORIAL_INICIALIZADO_KEY, 'true');
    } catch (error: unknown) {
      console.error('No se pudo inicializar el historial de movimientos:', error);
    }
  }

  listarLocales(): MovimientoResidente[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const guardados = window.localStorage.getItem(MOVIMIENTOS_STORAGE_KEY);
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
        const tipo = movimiento['tipo'];
        if (tipo !== 'reserva' && tipo !== 'visitante-aprobado') {
          return [];
        }

        return [{
          id: movimiento['id'],
          hora: movimiento['hora'],
          fechaRegistro: typeof fechaRegistro === 'string' && !Number.isNaN(Date.parse(fechaRegistro))
            ? fechaRegistro
            : new Date(0).toISOString(),
          tipo,
          descripcion: movimiento['descripcion'],
          ubicacion: movimiento['ubicacion'],
          detalle: movimiento['detalle']
        }];
      });
    } catch (error: unknown) {
      console.error('No se pudieron leer los últimos movimientos guardados:', error);
      return [];
    }
  }

  registrar(
    movimiento: Omit<MovimientoResidente, 'id' | 'hora' | 'fechaRegistro'> & {
      tipo: 'reserva' | 'visitante-aprobado';
    }
  ): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const ahora = new Date();
      const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      const movimientos = this.listarLocales();
      const siguienteId = Math.max(Date.now(), ...movimientos.map((item) => item.id + 1));
      const nuevoMovimiento: MovimientoResidente = {
        ...movimiento,
        id: siguienteId,
        hora,
        fechaRegistro: ahora.toISOString()
      };

      window.localStorage.setItem(
        MOVIMIENTOS_STORAGE_KEY,
        JSON.stringify([nuevoMovimiento, ...movimientos])
      );
    } catch (error: unknown) {
      console.error('No se pudo guardar el movimiento en el historial local:', error);
    }
  }
}
