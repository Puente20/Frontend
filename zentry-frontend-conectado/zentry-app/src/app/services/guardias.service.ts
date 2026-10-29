import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
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

  crearGuardia(payload: CrearGuardiaPayload): Observable<HttpResponse<string>> {
    return this.http.post(`${this.apiUrl}/`, payload, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      timeout({ first: 15000 })
    );
  }
}
