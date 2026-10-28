import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoInvitacion = 'unica' | 'concurrente';

export interface Invitacion {
  id: string;
  tipo: TipoInvitacion;
  nombreVisitante: string;
  dni: string;
  qrToken: string;
  porton?: string;
  fechaInicio?: string;
  fechaFin?: string;
  dias?: string[];
  creadaEn: string;
  usadaEn: string | null;
}

export type NuevaInvitacion = Pick<
  Invitacion,
  'tipo' | 'nombreVisitante' | 'dni' | 'porton' | 'fechaInicio' | 'fechaFin' | 'dias'
>;

@Injectable({ providedIn: 'root' })
export class InvitacionService {
  private readonly apiUrl = `${environment.apiUrl}/invitaciones`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las invitaciones activas guardadas en el backend de Django.
   */
  listarActivasApi(): Observable<Invitacion[]> {
    return this.http.get<Invitacion[]>(`${this.apiUrl}/?activas=true`);
  }

  /**
   * Crea una invitación en el backend y recibe su token QR firmado.
   */
  guardarEnBackend(datos: NuevaInvitacion): Observable<Invitacion> {
    return this.http.post<Invitacion>(`${this.apiUrl}/`, datos);
  }

  validarQrEnBackend(token: string): Observable<Invitacion> {
    return this.http.post<Invitacion>(`${this.apiUrl}/validar-qr/`, { token });
  }

  /**
   * Elimina una invitación del backend.
   */
  eliminarEnBackend(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}/`);
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
}
