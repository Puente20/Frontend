import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertaEmergencia {
  id: number;
  nombre_completo: string;
  numero_lote: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class EmergenciasService {
  private readonly base = `${environment.apiUrl}/eventos/panico/`;

  constructor(private http: HttpClient) {}

  pendientes(): Observable<{ alertas: AlertaEmergencia[] }> {
    return this.http.get<{ alertas: AlertaEmergencia[] }>(`${this.base}pendientes/`);
  }

  resolver(id: number, accion: 'enviar_movil' | 'rechazar'):
    Observable<{ estado: string; mensaje: string }> {
    return this.http.post<{ estado: string; mensaje: string }>(
      `${this.base}${id}/resolver/`, { accion }
    );
  }
}
