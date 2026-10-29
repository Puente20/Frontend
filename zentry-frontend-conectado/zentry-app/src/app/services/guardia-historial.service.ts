import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoMovimientoGuardia = 'ingreso' | 'egreso';

export interface MovimientoGuardia {
  id: number | string;
  tipo: TipoMovimientoGuardia;
  nombre: string;
  dni: string;
  fechaRegistro: string;
}

@Injectable({ providedIn: 'root' })
export class GuardiaHistorialService {
  private readonly apiUrl = `${environment.apiUrl}/movimientos/`;

  constructor(private http: HttpClient) {}

  getMovimientos(): Observable<MovimientoGuardia[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((respuesta) => this.normalizarMovimientos(respuesta))
    );
  }

  private normalizarMovimientos(respuesta: unknown): MovimientoGuardia[] {
    const registros = this.obtenerRegistros(respuesta);
    if (!registros) {
      throw new Error('El endpoint de movimientos no devolvió una lista.');
    }

    const movimientos = registros.flatMap((valor: unknown, index: number): MovimientoGuardia[] => {
      if (typeof valor !== 'object' || valor === null) {
        return [];
      }

      const registro = valor as Record<string, unknown>;
      const tipo = registro['tipo'] ?? registro['tipo_movimiento'];
      if (tipo !== 'ingreso' && tipo !== 'visitante-aprobado' && tipo !== 'egreso') {
        return [];
      }

      const fechaRegistro = registro['fechaRegistro'] ?? registro['fecha_registro'];
      if (typeof fechaRegistro !== 'string' || Number.isNaN(Date.parse(fechaRegistro))) {
        throw new Error(`El movimiento ${index + 1} no contiene una fecha válida.`);
      }

      const descripcion = typeof registro['descripcion'] === 'string'
        ? registro['descripcion']
        : '';
      const detalle = typeof registro['detalle'] === 'string' ? registro['detalle'] : '';
      const dniCampo = registro['dni'] ?? registro['documento'];
      const dni = typeof dniCampo === 'string'
        ? dniCampo
        : detalle.match(/\bDNI\s*:?\s*(\d{7,8})\b/i)?.[1]
          ?? descripcion.match(/\bDNI\s*:?\s*(\d{7,8})\b/i)?.[1]
          ?? '';
      const nombreCampo = registro['nombre']
        ?? registro['nombreVisitante']
        ?? registro['nombre_visitante']
        ?? registro['nombre_completo']
        ?? registro['persona'];
      const nombreNormalizado = typeof nombreCampo === 'string' ? nombreCampo.trim() : '';
      const nombre = nombreNormalizado && nombreNormalizado.toLowerCase() !== 'nombre no disponible'
        ? nombreNormalizado
        : this.extraerNombre(detalle)
          ?? this.extraerNombre(descripcion)
          ?? '';
      const id = typeof registro['id'] === 'number' || typeof registro['id'] === 'string'
        ? registro['id']
        : `${tipo}-${fechaRegistro}-${index}`;

      return [{
        id,
        tipo: tipo === 'egreso' ? 'egreso' : 'ingreso',
        nombre,
        dni,
        fechaRegistro
      }];
    }).sort((a, b) => Date.parse(b.fechaRegistro) - Date.parse(a.fechaRegistro));

    return movimientos.map((movimiento) => {
      if (movimiento.nombre) {
        return movimiento;
      }

      const ingresoRelacionado = movimientos.find((otro) =>
        movimiento.tipo === 'egreso'
        && movimiento.dni.length > 0
        && otro.tipo === 'ingreso'
        && otro.dni === movimiento.dni
        && otro.nombre
      );

      return ingresoRelacionado
        ? { ...movimiento, nombre: ingresoRelacionado.nombre }
        : { ...movimiento, nombre: 'Nombre no disponible' };
    });
  }

  private obtenerRegistros(respuesta: unknown): unknown[] | null {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (typeof respuesta !== 'object' || respuesta === null) {
      return null;
    }

    const objeto = respuesta as Record<string, unknown>;
    const registros = objeto['results'] ?? objeto['movimientos'];
    return Array.isArray(registros) ? registros : null;
  }

  private extraerNombre(texto: string): string | null {
    const coincidencia = texto.match(
      /(?:visitante autorizado|ingreso autorizado|ingreso registrado|egreso autorizado|egreso registrado|nombre|visitante)\s*(?::|-\s*)\s*([^.;\n]+)/i
    );
    const nombre = coincidencia?.[1]?.trim();
    return nombre && !/^(?:DNI|documento)\b/i.test(nombre) ? nombre : null;
  }
}
