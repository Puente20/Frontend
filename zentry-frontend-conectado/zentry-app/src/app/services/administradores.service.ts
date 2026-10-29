import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CrearAdministradorPayload {
  nombre: string;
  dni: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AdministradoresService {
  private readonly apiUrl = `${environment.apiUrl}/administradores`;

  constructor(private http: HttpClient) {}

  crearAdministrador(payload: CrearAdministradorPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/`, payload).pipe(
      timeout({ first: 15000 })
    );
  }
}
