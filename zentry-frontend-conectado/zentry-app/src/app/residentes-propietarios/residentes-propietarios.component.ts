import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentesService } from '../services/residentes.service';

export interface ResidentePropietario {
  id: number;
  nombre: string;
  lote: number;
  telefono: string;
  email?: string;
  dni?: string;
  tipo: 'propietario';
}

@Component({
  selector: 'app-residentes-propietarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residentes-propietarios.component.html',
  styleUrl: './residentes-propietarios.component.css'
})
export class ResidentesPropietariosComponent implements OnInit {
  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
  fechaActual: string = '13 de Agosto de 2026';
  nombreBarrio: string = 'La Reserva Cardales';

  tabActiva: 'inicio' | 'residentes' | 'ajustes' = 'residentes';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  private readonly propietariosMock: ResidentePropietario[] = [
    { id: 1, nombre: 'Valentina Canepa', lote: 3, telefono: '+5491143218765', tipo: 'propietario' },
    { id: 2, nombre: 'Santiago Perez', lote: 12, telefono: '+5491154329876', tipo: 'propietario' },
    { id: 3, nombre: 'Maria Rodriguez', lote: 18, telefono: '+5491165430987', tipo: 'propietario' },
    { id: 4, nombre: 'Lucas Fernandez', lote: 27, telefono: '+5491176541098', tipo: 'propietario' },
    { id: 5, nombre: 'Camila Martinez', lote: 34, telefono: '+5491187652109', tipo: 'propietario' },
    { id: 6, nombre: 'Nicolas Gomez', lote: 46, telefono: '+5491198763210', tipo: 'propietario' },
    { id: 7, nombre: 'Florencia Lopez', lote: 62, telefono: '+5491132109876', tipo: 'propietario' },
    { id: 8, nombre: 'Agustin Torres', lote: 81, telefono: '+5491121098765', tipo: 'propietario' }
  ];

  propietarios: ResidentePropietario[] = [];

  constructor(private router: Router, private residentesService: ResidentesService) {}

  ngOnInit(): void {
    this.cargarPropietarios();
  }

  cargarPropietarios(): void {
    this.cargando = true;
    this.residentesService.listarPropietarios().subscribe({
      next: (datos) => {
        this.propietarios = datos.length > 0
          ? datos.map((d) => ({ ...d, tipo: 'propietario' as const }))
          : this.propietariosMock;
        this.cargando = false;
      },
      error: (err) => {
        console.warn('Usando propietarios mock por falta de conexión al backend:', err);
        this.propietarios = this.propietariosMock;
        this.cargando = false;
      }
    });
  }

  get propietariosFiltrados(): ResidentePropietario[] {
    const consulta = this.normalizarTexto(this.terminoBusqueda);
    if (!consulta) {
      return this.propietarios;
    }

    return this.propietarios.filter((propietario) => {
      const nombreNormalizado = this.normalizarTexto(propietario.nombre);
      const loteTexto = `lote ${propietario.lote}`;
      const loteNumero = String(propietario.lote);

      return (
        nombreNormalizado.includes(consulta) ||
        loteTexto.includes(consulta) ||
        loteNumero.includes(consulta)
      );
    });
  }

  onBuscarChange(valor: string): void {
    this.terminoBusqueda = valor;
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
  }

  irAInquilinos(): void {
    void this.router.navigate(['/residentes-inquilinos']);
  }

  contactarPorWhatsapp(propietario: ResidentePropietario, event?: MouseEvent): void {
    event?.stopPropagation();

    const telefonoLimpio = propietario.telefono.replace(/\D/g, '');
    const mensaje = `Hola ${propietario.nombre} (Lote ${propietario.lote}), te contactamos desde la administración de ${this.nombreBarrio}.`;
    const urlWhatsapp = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;

    if (typeof window !== 'undefined') {
      window.open(urlWhatsapp, '_blank', 'noopener,noreferrer');
    }
  }

  cambiarTabNav(tab: 'inicio' | 'residentes' | 'ajustes'): void {
    this.tabActiva = tab;
    if (tab === 'inicio') {
      void this.router.navigate(['/admin-home']);
      return;
    }
    if (tab === 'residentes') {
      void this.router.navigate(['/editar-residentes']);
      return;
    }
    if (tab === 'ajustes') {
      void this.router.navigate(['/admin-home'], { queryParams: { tab: 'ajustes' } });
    }
  }

  trackByPropietarioId(_index: number, item: ResidentePropietario): number {
    return item.id;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}