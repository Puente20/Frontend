import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EmergenciasService, AlertaEmergencia } from '../services/emergencias.service';
import { environment } from '../../environments/environment';

interface EventoPanico {
  alerta_id: number;
  nro_lote: number;
  telefono: string;
  razon: string;
  nombre: string;
}

@Component({
  selector: 'app-guardia-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guardia-home.component.html',
  styleUrl: './guardia-home.component.css'
})
export class GuardiaHomeComponent implements OnInit, OnDestroy {
  alertas: AlertaEmergencia[] = [];
  procesando = false;
  errorAlerta = '';

  private controller = new AbortController();
  private reconexion?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private auth: AuthService,
    private emergencias: EmergenciasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.escucharStream();
  }

  private async escucharStream(): Promise<void> {
    if (this.controller.signal.aborted) return;

    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('zentry_token')
      : null;
    if (!token) {
      console.error('No hay token para conectar el stream de emergencias.');
      return;
    }

    try {
      const response = await fetch(`${environment.apiUrl}/eventos/stream/`, {
        headers: {
          Authorization: `Token ${token}`,
          Accept: 'text/event-stream'
        },
        cache: 'no-store',
        signal: this.controller.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error al conectar el stream: ${response.status}`);
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      let buffer = '';

      while (!this.controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let separador: number;
        while ((separador = buffer.indexOf('\n\n')) !== -1) {
          const bloque = buffer.slice(0, separador);
          buffer = buffer.slice(separador + 2);
          const data = bloque.split('\n')
            .filter(linea => linea.startsWith('data:'))
            .map(linea => linea.slice(5).trimStart())
            .join('\n');

          // Los comentarios SSE (: ok y : ping) no contienen data.
          if (!data) continue;
          try {
            this.recibirAlerta(JSON.parse(data) as EventoPanico);
          } catch (error) {
            console.error('Evento SSE incorrecto:', error);
          }
        }
      }
    } catch (error) {
      if (!this.controller.signal.aborted) {
        console.error('Se interrumpio el stream de emergencias:', error);
      }
    }

    // Solo se reconecta cuando la conexion se cierra; no hay polling HTTP.
    if (!this.controller.signal.aborted) {
      this.reconexion = setTimeout(() => void this.escucharStream(), 3000);
    }
  }

  private recibirAlerta(evento: EventoPanico): void {
    if (this.alertas.some(alerta => alerta.id === evento.alerta_id)) return;

    const alerta: AlertaEmergencia = {
      id: evento.alerta_id,
      estado: 'enviada',
      razon: evento.razon,
      created_at: new Date().toISOString(),
      socio: {
        id: 0,
        nombre_completo: evento.nombre ?? '',
        telefono: evento.telefono
      },
      lote: {
        id: 0,
        numero: evento.nro_lote
      }
    };

    this.alertas = [...this.alertas, alerta];
    this.cdr.detectChanges();
  }

  get alertaActual(): AlertaEmergencia | undefined { return this.alertas[0]; }

  responder(accion: 'enviar_movil' | 'rechazar'): void {
    const alerta = this.alertaActual;
    if (!alerta || this.procesando) return;
    let motivo = '';
    if (accion === 'rechazar') {
      const valor = window.prompt('Motivo obligatorio para rechazar la emergencia:');
      if (valor === null) return;
      motivo = valor.trim();
      if (!motivo) { this.errorAlerta = 'El motivo de rechazo es obligatorio.'; return; }
    }
    this.errorAlerta = '';
    this.procesando = true;
    this.emergencias.responder(alerta.id, accion, motivo).subscribe({
      next: () => {
        this.alertas = this.alertas.filter(a => a.id !== alerta.id);
        this.procesando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorAlerta = err.error?.detail || 'No se pudo registrar la respuesta.';
        this.procesando = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.controller.abort();
    clearTimeout(this.reconexion);
  }
  irAEscanearQR(): void { void this.router.navigate(['/escanear-qr']); }
  irARegistrarEgreso(): void { void this.router.navigate(['/registrar-egreso']); }
  irAHistorial(): void { void this.router.navigate(['/historial-guardia']); }
  cerrarSesion(): void {
    this.controller.abort();
    clearTimeout(this.reconexion);
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
