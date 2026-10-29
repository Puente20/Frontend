import { Injectable } from '@angular/core';
import { Observable, map, timer } from 'rxjs';

export type MedioPagoSum = 'saldo' | 'tarjeta-1234' | 'tarjeta-4567';

export interface PagoSimulado {
  transaccionId: string;
  monto: number;
  medio: MedioPagoSum;
  estado: 'aprobado';
}

@Injectable({ providedIn: 'root' })
export class SimuladorPagoService {
  simularPago(monto: number, medio: MedioPagoSum): Observable<PagoSimulado> {
    return timer(1200).pipe(
      map(() => ({
        transaccionId: `SIM-${Date.now()}`,
        monto,
        medio,
        estado: 'aprobado' as const
      }))
    );
  }
}
