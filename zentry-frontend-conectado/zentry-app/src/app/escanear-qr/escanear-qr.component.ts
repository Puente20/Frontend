import { Component, ElementRef, NgZone, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvitacionService } from '../invitaciones-activas/invitacion.service';
import type { IScannerControls } from '@zxing/browser';

@Component({
  selector: 'app-escanear-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './escanear-qr.component.html',
  styleUrl: './escanear-qr.component.css'
})
export class EscanearQrComponent implements OnDestroy {
  @ViewChild('camaraVideo') private camaraVideo?: ElementRef<HTMLVideoElement>;

  readonly estadoEscaneo = signal('Tocá «Activar cámara» para comenzar a escanear.');
  readonly mensajeError = signal('');
  readonly escaneando = signal(false);
  readonly camaraIntentada = signal(false);

  private flujoCamara: MediaStream | null = null;
  private controlesEscaner: IScannerControls | null = null;
  readonly validacionEnCurso = signal(false);
  private componenteDestruido = false;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private invitacionService: InvitacionService
  ) {}

  ngOnDestroy(): void {
    this.componenteDestruido = true;
    this.detenerCamara();
  }

  activarCamara(): void {
    if (this.escaneando() || this.validacionEnCurso() || this.componenteDestruido) {
      return;
    }

    this.mensajeError.set('');
    this.detenerCamara();
    this.camaraIntentada.set(true);
    void this.iniciarCamara();
  }

  private async iniciarCamara(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || !this.camaraVideo) {
      this.ngZone.run(() => {
        this.escaneando.set(false);
        this.estadoEscaneo.set('No se puede acceder a la cámara. Usá localhost o HTTPS y verificá que haya una cámara disponible.');
      });
      return;
    }

    this.ngZone.run(() => {
      this.escaneando.set(true);
      this.estadoEscaneo.set('Cargando el lector QR…');
    });

    try {
      const video = this.camaraVideo.nativeElement;
      this.ngZone.run(() => {
        this.estadoEscaneo.set('Solicitando acceso a la cámara…');
      });

      const solicitudCamara = navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'user' } },
        audio: false
      });
      const lectorQr = import('@zxing/browser');
      const [{ BrowserQRCodeReader }, flujoCamara] = await Promise.all([
        lectorQr,
        solicitudCamara
      ]);
      const lector = new BrowserQRCodeReader();

      if (this.componenteDestruido || !this.escaneando()) {
        flujoCamara.getTracks().forEach((track) => track.stop());
        return;
      }

      this.flujoCamara = flujoCamara;
      video.srcObject = flujoCamara;
      await video.play();
      await this.esperarImagenCamara(video);
      this.ngZone.run(() => {
        this.estadoEscaneo.set('Cámara activa; iniciando escaneo…');
      });

      const controles = await lector.decodeFromStream(
        flujoCamara,
        video,
        (resultado, error, controlesActuales) => {
          this.ngZone.run(() => {
            this.controlesEscaner = controlesActuales;

            if (resultado && this.escaneando()) {
              this.escaneando.set(false);
              this.detenerCamara();
              this.validarInvitacion(resultado.getText());
            } else if (error && !this.esErrorDeLecturaEsperable(error) && this.escaneando()) {
              console.error('No se pudo leer el código QR:', error);
              this.escaneando.set(false);
              this.detenerCamara();
              this.estadoEscaneo.set('No se pudo leer el QR. Podés intentar nuevamente.');
            }
          });
        }
      );

      if (this.componenteDestruido || !this.escaneando()) {
        controles.stop();
        return;
      }

      this.controlesEscaner = controles;
      this.ngZone.run(() => {
        this.estadoEscaneo.set('Enfocá el QR del visitante dentro del recuadro.');
      });
    } catch (error: unknown) {
      console.error('No se pudo iniciar la cámara para escanear el QR:', error);
      this.detenerCamara();
      this.ngZone.run(() => {
        this.estadoEscaneo.set(this.mensajeErrorCamara(error));
      });
    }
  }

  private esperarImagenCamara(video: HTMLVideoElement): Promise<void> {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        limpiarEventos();
        reject(new Error('La cámara se abrió, pero no está enviando imagen.'));
      }, 5000);

      const limpiarEventos = (): void => {
        window.clearTimeout(timeout);
        video.removeEventListener('loadedmetadata', alCargarMetadata);
        video.removeEventListener('error', alFallarVideo);
      };

      const alCargarMetadata = (): void => {
        limpiarEventos();
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
        } else {
          reject(new Error('La cámara se abrió, pero no está enviando imagen.'));
        }
      };

      const alFallarVideo = (): void => {
        limpiarEventos();
        reject(new Error('No se pudo mostrar la imagen de la cámara.'));
      };

      video.addEventListener('loadedmetadata', alCargarMetadata, { once: true });
      video.addEventListener('error', alFallarVideo, { once: true });
    });
  }

  private esErrorDeLecturaEsperable(error: Error): boolean {
    return ['NotFoundException', 'ChecksumException', 'FormatException'].includes(error.name);
  }

  private validarInvitacion(contenido: string): void {
    const token = contenido.trim();
    if (!token) {
      this.estadoEscaneo.set('El QR no contiene un token de invitación válido.');
      return;
    }

    this.validacionEnCurso.set(true);
    this.estadoEscaneo.set('Validando invitación…');
    this.mensajeError.set('');

    this.invitacionService.validarQrEnBackend(token).subscribe({
      next: (invitacion) => {
        this.estadoEscaneo.set('Ingreso autorizado.');
        this.validacionEnCurso.set(false);
      },
      error: (error: unknown) => {
        console.error('El backend no pudo autorizar la invitación escaneada:', error);
        this.mensajeError.set('El QR es inválido, venció o ya fue utilizado. No se autorizó el ingreso.');
        this.estadoEscaneo.set('Invitación no autorizada.');
        this.validacionEnCurso.set(false);
      }
    });
  }

  reintentarEscaneo(): void {
    this.activarCamara();
  }

  private detenerCamara(): void {
    this.escaneando.set(false);
    this.controlesEscaner?.stop();
    this.controlesEscaner = null;
    this.flujoCamara?.getTracks().forEach((track) => track.stop());
    this.flujoCamara = null;
    if (this.camaraVideo) {
      this.camaraVideo.nativeElement.srcObject = null;
    }
  }

  private mensajeErrorCamara(error: unknown): string {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        return 'Se bloqueó el acceso a la cámara. Habilitá el permiso para este sitio y volvé a intentar.';
      }
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        return 'No se encontró una cámara conectada o disponible.';
      }
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        return 'La cámara está siendo usada por otra aplicación. Cerrala y volvé a intentar.';
      }
      if (error.name === 'OverconstrainedError') {
        return 'No se encontró una cámara compatible. Revisá que haya una cámara conectada.';
      }
      if (error.message.includes('no está enviando imagen')) {
        return error.message;
      }
    }

    return 'No se pudo acceder a la cámara. Revisá los permisos del navegador e intentá nuevamente.';
  }

  volver(): void {
    this.detenerCamara();
    this.router.navigate(['/guardia-home']);
  }
}