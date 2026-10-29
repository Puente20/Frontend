import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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
  errorMensaje = '';

  constructor(private router: Router, private reservasService: ReservasService) {}

  onRechazar(): void {
    this.cerrar.emit();

    if (this.router.url.includes('panic-button')) {
      void this.router.navigate(['/resident-home']);
    }
  }

  onConfirmar(): void {
    if (this.enviando) return;
    this.enviando = true;
    this.errorMensaje = '';
    this.reservasService.enviarAlertaPanico().subscribe({
      next: () => {
        this.enviando = false;
        this.confirmar.emit();
        if (this.router.url.includes('panic-button')) void this.router.navigate(['/resident-home']);
      },
      error: (error) => {
        this.enviando = false;
        this.errorMensaje = error.error?.detail || 'No se pudo enviar la alerta. Volve a intentarlo o llama a seguridad.';
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
    if (this.isOpen) {
      this.onRechazar();
    }
  }
}
