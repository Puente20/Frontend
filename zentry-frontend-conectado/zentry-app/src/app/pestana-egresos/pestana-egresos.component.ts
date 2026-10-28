import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';

type TipoEntrada = 'ingreso' | 'egreso';

interface Movimiento {
  id?: number | string;
  nombre: string;
  dni: string;
  horario: string;
}

@Component({
  selector: 'app-pestana-egresos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pestana-egresos.component.html',
  styleUrl: './pestana-egresos.component.css'
})

export class PestanaEgresosComponent implements OnInit {

  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
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

  if (tab === 'inicio') {
    void this.router.navigate(['/admin-home']);
    return;
  }

  void this.router.navigate(['/admin-home'], { queryParams: { tab: 'ajustes' } });
}
  readonly fechaActual = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  readonly nombreBarrio = 'La Reserva Cardales';

  tipoEntrada: TipoEntrada = 'ingreso';
  cargando = false;
  ingresosFiltrados: Movimiento[] = [];
  egresosFiltrados: Movimiento[] = [];

  cambiarTipoEntrada(tipo: TipoEntrada): void {
    this.tipoEntrada = tipo;
  }

  trackByIngresoId(index: number, ingreso: Movimiento): number | string {
    return ingreso.id ?? `${ingreso.dni}-${ingreso.horario}-${index}`;
  }

  trackByEgresoId(index: number, egreso: Movimiento): number | string {
    return egreso.id ?? `${egreso.dni}-${egreso.horario}-${index}`;
  }
}