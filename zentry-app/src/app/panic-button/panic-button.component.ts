import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'panic-button, app-panic-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panic-button.component.html',
  styleUrl: './panic-button.component.css',
})
export class PanicButtonComponent {
  @Input() isOpen: boolean = true;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  constructor(private router: Router) {}

  onRechazar(): void {
    this.cerrar.emit();

    if (this.router.url.includes('panic-button')) {
      void this.router.navigate(['/resident-home']);
    }
  }

  onConfirmar(): void {
    console.log('Alerta de emergencia confirmada: notificando a Seguridad y activando protocolo.');
    this.confirmar.emit();

    if (this.router.url.includes('panic-button')) {
      void this.router.navigate(['/resident-home']);
    }
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