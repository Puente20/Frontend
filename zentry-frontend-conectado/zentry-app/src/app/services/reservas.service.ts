import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { InstalacionBarrio, SolicitudReserva } from '../nueva-reserva/nueva-reserva.component';
import { MovimientoResidente } from './activity-log.service';

const RESERVAS_LOCALES_KEY = 'zentry_reservas_locales';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerInstalaciones(): Observable<InstalacionBarrio[]> {
    return this.http.get<InstalacionBarrio[]>(`${this.baseUrl}/barrios/instalaciones/`);
  }

  crearReserva(payload: SolicitudReserva): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/reservas/`, payload);
  }

  existeReservaLocal(payload: SolicitudReserva): boolean {
    return this.listarReservasLocales().some((reserva) =>
      reserva.fecha === payload.fecha &&
      reserva.horario === payload.horario &&
      (
        reserva.instalacionId === payload.instalacionId ||
        this.normalizarNombre(reserva.instalacionNombre) === this.normalizarNombre(payload.instalacionNombre)
      )
    );
  }

  registrarReservaLocal(payload: SolicitudReserva): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const reservas = this.listarReservasLocales();
      if (this.existeReservaLocal(payload)) {
        return;
      }
      window.localStorage.setItem(RESERVAS_LOCALES_KEY, JSON.stringify([...reservas, payload]));
    } catch (error: unknown) {
      console.error('No se pudo guardar la reserva local para evitar duplicados:', error);
    }
  }

  private listarReservasLocales(): SolicitudReserva[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const guardadas = window.localStorage.getItem(RESERVAS_LOCALES_KEY);
      if (!guardadas) {
        return [];
      }

      const parseadas: unknown = JSON.parse(guardadas);
      if (!Array.isArray(parseadas)) {
        console.error('El registro local de reservas tiene un formato inválido.');
        return [];
      }

      return parseadas.filter((valor: unknown): valor is SolicitudReserva => {
        if (typeof valor !== 'object' || valor === null) {
          return false;
        }
        const reserva = valor as Record<string, unknown>;
        return typeof reserva['instalacionId'] === 'string' &&
          typeof reserva['instalacionNombre'] === 'string' &&
          typeof reserva['fecha'] === 'string' &&
          typeof reserva['horario'] === 'string' &&
          typeof reserva['cantidadMaximaPersonas'] === 'number' &&
          (reserva['tipoOperacion'] === 'confirmar' || reserva['tipoOperacion'] === 'senar');
      });
    } catch (error: unknown) {
      console.error('No se pudieron leer las reservas locales:', error);
      return [];
    }
  }

  private normalizarNombre(nombre: string): string {
    return nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es-AR');
  }

  obtenerUltimosMovimientos(): Observable<MovimientoResidente[]> {
    return this.http.get<MovimientoResidente[]>(`${this.baseUrl}/movimientos/`);
  }

  enviarAlertaPanico(): Observable<{ status: string; mensaje: string }> {
    return this.http.post<{ status: string; mensaje: string }>(`${this.baseUrl}/eventos/panico/`, {});
  }
}
