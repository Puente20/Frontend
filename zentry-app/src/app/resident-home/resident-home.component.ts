import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PanicButtonComponent } from '../panic-button/panic-button.component';

interface ResidentRequest {
  user: {
    first_name: string;
  };
}

@Component({
  selector: 'app-resident-home',
  standalone: true,
  imports: [CommonModule, PanicButtonComponent],
  templateUrl: './resident-home.component.html',
  styleUrl: './resident-home.component.css'
})
export class ResidentHomeComponent {
  request: ResidentRequest = {
    user: {
      first_name: 'Tomás'
    }
  };

  mostrarModalPanico: boolean = false;

  constructor(private router: Router) {}

  irAQr(): void {
    this.router.navigate(['/generar-qr']);
  }

  IrAPanic(): void {
    this.mostrarModalPanico = true;
  }

  cerrarModalPanico(): void {
    this.mostrarModalPanico = false;
  }

  confirmarEmergencia(): void {
    this.mostrarModalPanico = false;
  }

  IrANuevaReserva(): void {
    this.router.navigate(['/nueva-reserva']);
  }
}