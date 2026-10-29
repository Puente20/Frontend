import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import {
  GuardiaHistorialService,
  MovimientoGuardia
} from '../services/guardia-historial.service';

type TipoEntrada = 'ingreso' | 'egreso';

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
    private route: ActivatedRoute,
    private historialService: GuardiaHistorialService,
    private cdr: ChangeDetectorRef
  ) {}

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
  mensajeError = '';
  movimientos: MovimientoGuardia[] = [];

  get ingresosFiltrados(): MovimientoGuardia[] {
    return this.movimientos.filter((movimiento) => movimiento.tipo === 'ingreso');
  }

  get egresosFiltrados(): MovimientoGuardia[] {
    return this.movimientos.filter((movimiento) => movimiento.tipo === 'egreso');
  }

  mostrarFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(fecha));
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab === 'ajustes') {
        this.tabActiva = 'ajustes';
      } else if (tab === 'inicio') {
        this.tabActiva = 'inicio';
      }
    });

    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.historialService.getMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos = movimientos;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('No se pudo cargar el historial de ingresos y egresos:', error);
        this.mensajeError = 'No se pudo cargar el historial. Revisá la conexión con el servidor e intentá nuevamente.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  cambiarTipoEntrada(tipo: TipoEntrada): void {
    this.tipoEntrada = tipo;
  }

  trackByIngresoId(index: number, ingreso: MovimientoGuardia): number | string {
    return ingreso.id ?? `${ingreso.dni}-${ingreso.fechaRegistro}-${index}`;
  }

  trackByEgresoId(index: number, egreso: MovimientoGuardia): number | string {
    return egreso.id ?? `${egreso.dni}-${egreso.fechaRegistro}-${index}`;
  }
}