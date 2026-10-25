import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioSesion {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: 'administrador' | 'residente' | 'guardia';
  role_code: string;
  socio_id: number | null;
  lote: number;
}

export interface LoginResponse {
  token: string;
  user: UsuarioSesion;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'zentry_token';
  private readonly userKey = 'zentry_user';

  constructor(private http: HttpClient) {}

  login(identificador: string, password: string, rol: 'administrador' | 'residente' | 'guardia'): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, {
      identificador,
      password,
      rol
    }).pipe(
      tap((respuesta) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(this.tokenKey, respuesta.token);
          window.localStorage.setItem(this.userKey, JSON.stringify(respuesta.user));
        }
      })
    );
  }

  recuperarContrasena(correo: string): Observable<{ status: string; mensaje: string }> {
    return this.http.post<{ status: string; mensaje: string }>(`${this.apiUrl}/recuperar-contrasena/`, { correo });
  }

  obtenerUsuarioActual(): UsuarioSesion | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const raw = window.localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UsuarioSesion;
    } catch {
      return null;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.tokenKey);
      window.localStorage.removeItem(this.userKey);
    }
  }
}
