import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservasService } from '../services/reservas.service';

@Component({
  selector: 'panic-button, app-panic-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panic-button.component.html',
  styleUrl: './panic-button.component.css',
})
export class PanicButtonComponent {
  @Input() isOpen = true;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  enviando = false;
  mensajeError = '';

  constructor(
    private router: Router,
    private reservasService: ReservasService,
    private cdr: ChangeDetectorRef
  ) {}

  onRechazar(): void {
    if (this.enviando) { return; }
    this.mensajeError = '';
    this.cerrar.emit();
    if (this.router.url.includes('panic-button')) {
      void this.router.navigate(['/resident-home']);
    }
  }

  onConfirmar(): void {
    if (this.enviando) { return; }
    this.enviando = true;
    this.mensajeError = '';
    this.reservasService.enviarAlertaPanico().subscribe({
      next: () => {
        this.enviando = false;
        this.cdr.markForCheck();
        this.confirmar.emit();
        if (this.router.url.includes('panic-button')) {
          void this.router.navigate(['/resident-home']);
        }
      },
      error: err => {
        this.enviando = false;
        this.mensajeError = err.error?.detail ||
          'No se pudo enviar la emergencia. Intentá nuevamente o contactá a Seguridad por otro medio.';
        this.cdr.markForCheck();
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('panic-overlay')) {
      this.onRechazar();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) { this.onRechazar(); }
  }
}
