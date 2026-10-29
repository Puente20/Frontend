import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertaEmergencia {
  id: number;
  estado: string;
  razon: string;
  created_at: string;
  socio: { id: number; nombre_completo: string; telefono: string } | null;
  lote: { id: number; numero: number } | null;
}

@Injectable({ providedIn: 'root' })
export class EmergenciasService {
  private url = `${environment.apiUrl}/eventos`;
  constructor(private http: HttpClient) {}
  pendientes(): Observable<AlertaEmergencia[]> {
    return this.http.get<AlertaEmergencia[]>(`${this.url}/pendientes/`);
  }
  responder(id: number, accion: 'enviar_movil' | 'rechazar', motivo_rechazo = ''): Observable<AlertaEmergencia> {
    return this.http.put<AlertaEmergencia>(`${this.url}/panico/${id}/`, { accion, motivo_rechazo });
  }
}
