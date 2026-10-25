import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoInvitacion = 'unica' | 'concurrente';

export interface Invitacion {
  id: string;
  tipo: TipoInvitacion;
  nombreVisitante: string;
  dni: string;
  porton?: string;
  fechaInicio?: string;
  fechaFin?: string;
  dias?: string[];
  creadaEn: string;
  usadaEn: string | null;
}

export type NuevaInvitacion = Omit<Invitacion, 'id' | 'creadaEn' | 'usadaEn'>;

@Injectable({ providedIn: 'root' })
export class InvitacionStorageService {
  private readonly storageKey = 'zentry-invitaciones';
  private readonly apiUrl = `${environment.apiUrl}/invitaciones`;

  constructor(private http: HttpClient) {}

  /**
   * Petición HTTP GET al backend de Django para obtener las invitaciones activas de la base de datos.
   */
  listarActivasApi(): Observable<Invitacion[]> {
    return this.http.get<Invitacion[]>(`${this.apiUrl}/?activas=true`).pipe(
      tap((remotas) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(this.storageKey, JSON.stringify(remotas));
        }
      })
    );
  }

  /**
   * Petición HTTP POST al backend de Django para guardar una nueva invitación en la base de datos.
   */
  guardarEnBackend(datos: NuevaInvitacion): Observable<Invitacion> {
    return this.http.post<Invitacion>(`${this.apiUrl}/`, datos).pipe(
      tap((creada) => {
        const actuales = this.leerTodas();
        actuales.unshift(creada);
        this.guardarTodas(actuales);
      })
    );
  }

  usarEnBackend(id: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/${encodeURIComponent(id)}/usar/`, {});
  }

  /**
   * Petición HTTP DELETE al backend de Django para eliminar una invitación de la base de datos.
   */
  eliminarEnBackend(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => {
        const filtradas = this.leerTodas().filter((inv) => inv.id !== id);
        this.guardarTodas(filtradas);
      })
    );
  }

  /**
   * Petición HTTP POST al backend de Django para registrar el egreso de visitantes por DNI.
   */
  registrarEgresoEnBackend(dnis: string[]): Observable<{ status: string; cantidad: number; mensaje: string }> {
    return this.http.post<{ status: string; cantidad: number; mensaje: string }>(
      `${this.apiUrl}/registrar-egreso/`,
      { dnis }
    );
  }

  listarActivas(fecha = new Date()): Invitacion[] {
    const hoy = this.fechaLocal(fecha);
    return this.leerTodas().filter((invitacion) => {
      if (invitacion.usadaEn) {
        return false;
      }

      if (invitacion.tipo === 'unica') {
        return true;
      }

      return Boolean(
        invitacion.fechaInicio &&
        invitacion.fechaFin &&
        invitacion.fechaInicio <= hoy &&
        invitacion.fechaFin >= hoy
      );
    });
  }

  guardar(datos: NuevaInvitacion): void {
    const invitaciones = this.leerTodas();
    invitaciones.push({
      ...datos,
      id: globalThis.crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
      usadaEn: null
    });
    this.guardarTodas(invitaciones);
  }

  marcarComoUsada(id: string): void {
    const invitaciones = this.leerTodas();
    const invitacion = invitaciones.find((item) => item.id === id);
    if (!invitacion) {
      throw new Error('No se encontró la invitación para marcarla como usada.');
    }

    invitacion.usadaEn = new Date().toISOString();
    this.guardarTodas(invitaciones);
  }

  eliminar(id: string): void {
    const invitaciones = this.leerTodas();
    const invitacionesFiltradas = invitaciones.filter((invitacion) => invitacion.id !== id);
    if (invitacionesFiltradas.length === invitaciones.length) {
      throw new Error('No se encontró la invitación para eliminarla.');
    }

    this.guardarTodas(invitacionesFiltradas);
  }

  private leerTodas(): Invitacion[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const guardadas = window.localStorage.getItem(this.storageKey);
    if (!guardadas) {
      return [];
    }

    let datos: unknown;
    try {
      datos = JSON.parse(guardadas);
    } catch {
      return [];
    }

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos as Invitacion[];
  }

  private guardarTodas(invitaciones: Invitacion[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(invitaciones));
  }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
