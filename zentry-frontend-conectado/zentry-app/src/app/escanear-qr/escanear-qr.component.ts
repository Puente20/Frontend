import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvitacionStorageService } from '../invitaciones-activas/invitacion-storage.service';
import { ActivityLogService } from '../services/activity-log.service';

interface CodigoQRDetectado {
  rawValue: string;
}

interface DetectorCodigoQR {
  detect(source: HTMLVideoElement): Promise<CodigoQRDetectado[]>;
}

interface ConstructorDetectorCodigoQR {
  new (opciones: { formats: string[] }): DetectorCodigoQR;
}

interface WindowConDetectorQR extends Window {
  BarcodeDetector?: ConstructorDetectorCodigoQR;
}

@Component({
  selector: 'app-escanear-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './escanear-qr.component.html',
  styleUrl: './escanear-qr.component.css'
})
export class EscanearQrComponent implements AfterViewInit, OnDestroy {
  @ViewChild('camaraVideo') private camaraVideo?: ElementRef<HTMLVideoElement>;

  estadoEscaneo = 'Preparando cámara…';
  mensajeError = '';
  escaneando = false;
  detectorDisponible = false;

  private flujoCamara: MediaStream | null = null;
  private detector: DetectorCodigoQR | null = null;
  private framePendiente: number | null = null;
  validacionEnCurso = false;

  constructor(
    private router: Router,
    private invitacionStorage: InvitacionStorageService,
    private activityLog: ActivityLogService
  ) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const Constructor = (window as WindowConDetectorQR).BarcodeDetector;
    if (!Constructor) {
      this.estadoEscaneo = 'Este navegador no admite el escaneo QR por cámara.';
      return;
    }

    this.detector = new Constructor({ formats: ['qr_code'] });
    this.detectorDisponible = true;
    void this.iniciarCamara();
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  private async iniciarCamara(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || !this.camaraVideo) {
      this.estadoEscaneo = 'No se encontró una cámara disponible.';
      return;
    }

    try {
      this.flujoCamara = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      const video = this.camaraVideo.nativeElement;
      video.srcObject = this.flujoCamara;
      await video.play();
      this.escaneando = true;
      this.estadoEscaneo = 'Enfocá el QR del visitante dentro del recuadro.';
      this.buscarCodigoEnVideo(video);
    } catch (error: unknown) {
      console.error('No se pudo iniciar la cámara para escanear el QR:', error);
      this.estadoEscaneo = 'No se pudo acceder a la cámara. Revisá los permisos del navegador.';
    }
  }

  private async buscarCodigoEnVideo(video: HTMLVideoElement): Promise<void> {
    if (!this.escaneando || !this.detector) {
      return;
    }

    try {
      const codigos = await this.detector.detect(video);
      const contenido = codigos[0]?.rawValue.trim();
      if (contenido) {
        this.escaneando = false;
        this.validarInvitacion(contenido);
        return;
      }
    } catch (error: unknown) {
      console.error('No se pudo leer el código QR:', error);
      this.escaneando = false;
      this.estadoEscaneo = 'No se pudo leer el QR. Podés intentar nuevamente.';
      return;
    }

    this.framePendiente = requestAnimationFrame(() => {
      void this.buscarCodigoEnVideo(video);
    });
  }

  private validarInvitacion(contenido: string): void {
    const id = this.extraerIdInvitacion(contenido);
    if (!id) {
      this.estadoEscaneo = 'El QR no contiene un identificador de invitación válido.';
      return;
    }

    this.validacionEnCurso = true;
    this.estadoEscaneo = 'Validando invitación…';
    this.mensajeError = '';

    this.invitacionStorage.usarEnBackend(id).subscribe({
      next: () => {
        this.activityLog.registrar({
          tipo: 'visitante-aprobado',
          descripcion: 'Visitante autorizado',
          ubicacion: 'Ingreso principal',
          detalle: 'Acceso autorizado mediante QR'
        });
        this.estadoEscaneo = 'Ingreso autorizado.';
        this.validacionEnCurso = false;
      },
      error: (error: unknown) => {
        console.error('El backend no pudo autorizar la invitación escaneada:', error);
        this.mensajeError = 'El QR es inválido, venció o ya fue utilizado. No se autorizó el ingreso.';
        this.estadoEscaneo = 'Invitación no autorizada.';
        this.validacionEnCurso = false;
      }
    });
  }

  private extraerIdInvitacion(contenido: string): string {
    const valor = contenido.trim();
    if (!valor) {
      return '';
    }

    try {
      const datos: unknown = JSON.parse(valor);
      if (typeof datos === 'object' && datos !== null && 'id' in datos) {
        const id = datos.id;
        if (typeof id === 'string' || typeof id === 'number') {
          return String(id);
        }
      }
    } catch {
      // The QR may contain the invitation ID directly or a URL.
    }

    try {
      const url = new URL(valor, window.location.origin);
      const idEnQuery = url.searchParams.get('id');
      if (idEnQuery) {
        return idEnQuery;
      }

      const coincidencia = url.pathname.match(/\/invitaciones\/([^/]+)/i);
      if (coincidencia) {
        return decodeURIComponent(coincidencia[1]);
      }

      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
    } catch {
      return valor;
    }
  }

  reintentarEscaneo(): void {
    if (this.validacionEnCurso || !this.detector) {
      return;
    }

    this.mensajeError = '';
    if (this.flujoCamara && this.camaraVideo) {
      this.escaneando = true;
      this.estadoEscaneo = 'Enfocá el QR del visitante dentro del recuadro.';
      this.buscarCodigoEnVideo(this.camaraVideo.nativeElement);
      return;
    }

    void this.iniciarCamara();
  }

  private detenerCamara(): void {
    this.escaneando = false;
    if (this.framePendiente !== null) {
      cancelAnimationFrame(this.framePendiente);
      this.framePendiente = null;
    }
    this.flujoCamara?.getTracks().forEach((track) => track.stop());
    this.flujoCamara = null;
    if (this.camaraVideo) {
      this.camaraVideo.nativeElement.srcObject = null;
    }
  }

  volver(): void {
    this.detenerCamara();
    this.router.navigate(['/guardia-home']);
  }
}