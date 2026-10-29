import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CrearGuardiaPayload {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class GuardiasService {
  private readonly apiUrl = `${environment.apiUrl}/guardias`;

  constructor(private http: HttpClient) {}

  crearGuardia(payload: CrearGuardiaPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/`, payload).pipe(
      timeout({ first: 15000 })
    );
  }
}
