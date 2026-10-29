import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InstalacionBarrio, SolicitudReserva } from '../nueva-reserva/nueva-reserva.component';
import { MovimientoResidente } from './activity-log.service';

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

  obtenerUltimosMovimientos(): Observable<MovimientoResidente[]> {
    return this.http.get<MovimientoResidente[]>(`${this.baseUrl}/movimientos/`);
  }

  enviarAlertaPanico(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/eventos/panico/`, {});
  }
}
