import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {
  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
  fechaActual: string = '13 de Agosto de 2026';
  nombreBarrio: string = 'La Reserva Cardales';

  tabActiva: 'inicio' | 'perfil' | 'ajustes' = 'inicio';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab === 'ajustes') {
        this.tabActiva = 'ajustes';
      } else if (tab === 'inicio') {
        this.tabActiva = 'inicio';
      }
    });
  }

  cambiarTab(tab: 'inicio' | 'perfil' | 'ajustes'): void {
    if (tab === 'perfil') {
      void this.router.navigate(['/editar-residentes']);
      return;
    }

    this.tabActiva = tab;
  }

  seleccionarAccion(accion: 'alta' | 'editar' | 'historial' | 'guardia' | 'administrador'): void {
    if (accion === 'alta') {
      void this.router.navigate(['/alta-residentes']);
      return;
    }

    if (accion === 'editar') {
      void this.router.navigate(['/editar-residentes']);
      return;
    }
    if (accion === 'historial') {
      void this.router.navigate(['/pestana-egresos']);
      return;
    }

    if (accion === 'guardia') {
      void this.router.navigate(['/registrar-guardia']);
      return;
    }

    if (accion === 'administrador') {
      void this.router.navigate(['/alta-administrador']);
    }
  }

  cerrarSesion(): void {
    void this.router.navigate(['/login']);
  }
}