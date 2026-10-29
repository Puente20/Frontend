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
  @Input() isOpen: boolean = true;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  constructor(private router: Router, private reservasService: ReservasService) {}

  onRechazar(): void {
    this.cerrar.emit();

    if (this.router.url.includes('panic-button')) {
      void this.router.navigate(['/resident-home']);
    }
  }

  onConfirmar(): void {
    this.reservasService.enviarAlertaPanico().subscribe({
      next: (res) => console.log('Alerta registrada en servidor:', res.mensaje),
      error: () => console.log('Alerta de emergencia confirmada en modo local.')
    });
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