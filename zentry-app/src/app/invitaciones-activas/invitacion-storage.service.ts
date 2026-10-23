import { Injectable } from '@angular/core';

export type TipoInvitacion = 'unica' | 'concurrente';

export interface Invitacion {
  id: string;
  tipo: TipoInvitacion;
  nombreVisitante: string;
  dni: string;
  porton?: string;
  fechaInicio?: string;
  fechaFin?: string;
  dias?: string[];
  creadaEn: string;
  usadaEn: string | null;
}

export type NuevaInvitacion = Omit<Invitacion, 'id' | 'creadaEn' | 'usadaEn'>;

@Injectable({ providedIn: 'root' })
export class InvitacionStorageService {
  private readonly storageKey = 'zentry-invitaciones';

  listarActivas(fecha = new Date()): Invitacion[] {
    const hoy = this.fechaLocal(fecha);
    return this.leerTodas().filter((invitacion) => {
      if (invitacion.usadaEn) {
        return false;
      }

      if (invitacion.tipo === 'unica') {
        return true;
      }

      return Boolean(
        invitacion.fechaInicio &&
        invitacion.fechaFin &&
        invitacion.fechaInicio <= hoy &&
        invitacion.fechaFin >= hoy
      );
    });
  }

  guardar(datos: NuevaInvitacion): void {
    const invitaciones = this.leerTodas();
    invitaciones.push({
      ...datos,
      id: globalThis.crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
      usadaEn: null
    });
    this.guardarTodas(invitaciones);
  }

  marcarComoUsada(id: string): void {
    const invitaciones = this.leerTodas();
    const invitacion = invitaciones.find((item) => item.id === id);
    if (!invitacion) {
      throw new Error('No se encontró la invitación para marcarla como usada.');
    }

    invitacion.usadaEn = new Date().toISOString();
    this.guardarTodas(invitaciones);
  }

  eliminar(id: string): void {
    const invitaciones = this.leerTodas();
    const invitacionesFiltradas = invitaciones.filter((invitacion) => invitacion.id !== id);
    if (invitacionesFiltradas.length === invitaciones.length) {
      throw new Error('No se encontró la invitación para eliminarla.');
    }

    this.guardarTodas(invitacionesFiltradas);
  }

  private leerTodas(): Invitacion[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const guardadas = window.localStorage.getItem(this.storageKey);
    if (!guardadas) {
      return [];
    }

    let datos: unknown;
    try {
      datos = JSON.parse(guardadas);
    } catch {
      throw new Error('No se pudieron leer las invitaciones guardadas. Borra los datos de invitaciones y vuelve a intentar.');
    }

    if (!Array.isArray(datos) || !datos.every((item) => this.esInvitacion(item))) {
      throw new Error('Los datos guardados de invitaciones tienen un formato inválido.');
    }

    return datos;
  }

  private guardarTodas(invitaciones: Invitacion[]): void {
    if (typeof window === 'undefined') {
      throw new Error('No se pueden guardar invitaciones fuera del navegador.');
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(invitaciones));
  }

  private esInvitacion(valor: unknown): valor is Invitacion {
    if (typeof valor !== 'object' || valor === null) {
      return false;
    }

    const invitacion = valor as Record<string, unknown>;
    return (
      typeof invitacion['id'] === 'string' &&
      (invitacion['tipo'] === 'unica' || invitacion['tipo'] === 'concurrente') &&
      typeof invitacion['nombreVisitante'] === 'string' &&
      typeof invitacion['dni'] === 'string' &&
      typeof invitacion['creadaEn'] === 'string' &&
      (typeof invitacion['usadaEn'] === 'string' || invitacion['usadaEn'] === null) &&
      (invitacion['porton'] === undefined || typeof invitacion['porton'] === 'string') &&
      (invitacion['fechaInicio'] === undefined || typeof invitacion['fechaInicio'] === 'string') &&
      (invitacion['fechaFin'] === undefined || typeof invitacion['fechaFin'] === 'string') &&
      (invitacion['dias'] === undefined ||
        (Array.isArray(invitacion['dias']) && invitacion['dias'].every((dia) => typeof dia === 'string'))) &&
      (invitacion['tipo'] !== 'concurrente' ||
        (typeof invitacion['fechaInicio'] === 'string' &&
          typeof invitacion['fechaFin'] === 'string' &&
          Array.isArray(invitacion['dias'])))
    );
  }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
