import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {
  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
  fechaActual: string = '13 de Agosto de 2026';
  nombreBarrio: string = 'La Reserva Cardales';

  tabActiva: 'inicio' | 'perfil' | 'ajustes' = 'inicio';

  constructor(private router: Router) {}

  cambiarTab(tab: 'inicio' | 'perfil' | 'ajustes'): void {
    this.tabActiva = tab;
  }

  seleccionarAccion(accion: 'alta' | 'editar' | 'historial'): void {
    if (accion === 'alta') {
      void this.router.navigate(['/alta-residentes']);
      return;
    }

    console.log('Acción seleccionada:', accion);
  }

  cerrarSesion(): void {
    void this.router.navigate(['/login']);
  }
}