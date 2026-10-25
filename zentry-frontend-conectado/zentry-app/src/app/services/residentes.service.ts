import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResidenteDTO {
  id: number;
  nombre: string;
  apellido?: string;
  nombre_completo?: string;
  dni?: string;
  email?: string;
  telefono: string;
  tipo: 'propietario' | 'inquilino';
  lote: number;
  lote_numero?: number;
  rolPropiedad?: 'titular' | 'conviviente';
  patentes?: string[];
  fechaInicioContrato?: string | null;
  fechaFinContrato?: string | null;
}

export interface CrearResidentePayload {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: 'propietario' | 'inquilino';
  lote_numero: number;
  patentes: string[];
  rolPropiedad?: 'titular' | 'conviviente';
  fechaInicioContrato?: string;
  fechaFinContrato?: string;
}

@Injectable({ providedIn: 'root' })
export class ResidentesService {
  private readonly apiUrl = `${environment.apiUrl}/residentes`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ResidenteDTO[]> {
    return this.http.get<ResidenteDTO[]>(`${this.apiUrl}/`).pipe(
      map((items) => items.map((item) => this.normalizarResidente(item)))
    );
  }

  listarPropietarios(): Observable<ResidenteDTO[]> {
    return this.http.get<ResidenteDTO[]>(`${this.apiUrl}/propietarios/`).pipe(
      map((items) => items.map((item) => this.normalizarResidente(item)))
    );
  }

  listarInquilinos(): Observable<ResidenteDTO[]> {
    return this.http.get<ResidenteDTO[]>(`${this.apiUrl}/inquilinos/`).pipe(
      map((items) => items.map((item) => this.normalizarResidente(item)))
    );
  }

  crearResidente(payload: CrearResidentePayload): Observable<ResidenteDTO> {
    return this.http.post<ResidenteDTO>(`${this.apiUrl}/`, payload).pipe(
      map((item) => this.normalizarResidente(item))
    );
  }

  actualizarResidente(id: number, payload: Partial<CrearResidentePayload>): Observable<ResidenteDTO> {
    return this.http.patch<ResidenteDTO>(`${this.apiUrl}/${id}/`, payload).pipe(
      map((item) => this.normalizarResidente(item))
    );
  }

  eliminarResidente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  private normalizarResidente(item: ResidenteDTO): ResidenteDTO {
    const nombreCompleto = item.nombre_completo || `${item.nombre ?? ''} ${item.apellido ?? ''}`.trim();
    return {
      ...item,
      nombre: nombreCompleto || item.nombre,
      lote: Number(item.lote) || 1
    };
  }
}
