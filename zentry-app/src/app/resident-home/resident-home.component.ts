import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ResidentRequest {
  user: {
    first_name: string;
  };
}

@Component({
  selector: 'app-resident-home',
  standalone: true,
  templateUrl: './resident-home.component.html',
  styleUrl: './resident-home.component.css'
})
export class ResidentHomeComponent {
  request: ResidentRequest = {
    user: {
      first_name: 'Tomás'
    }
  };

  constructor(private router: Router) {}

  irAQr(): void {
    this.router.navigate(['/generar-qr']);
  }
  IrAPanic(): void {
    this.router.navigate(['/panic-button']);
  }
  IrANuevaReserva(): void {
    this.router.navigate(['/nueva-reserva']);
  }
}
