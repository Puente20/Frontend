import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guardia-home',
  standalone: true,
  templateUrl: './guardia-home.component.html',
  styleUrl: './guardia-home.component.css'
})
export class GuardiaHomeComponent {

  constructor(private router: Router) {}

  irAEscanearQR(): void {
    this.router.navigate(['/escanear-qr']);
  }

  irARegistrarEgreso(): void {
    this.router.navigate(['/registrar-egreso']);
  }

  irAHistorial(): void {
    this.router.navigate(['/historial-guardia']);
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}