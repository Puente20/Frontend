import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentesService } from '../services/residentes.service';

export interface ResidenteInquilino {
  id: number;
  nombre: string;
  lote: number;
  telefono: string;
  email?: string;
  dni?: string;
  fechaInicioContrato?: string | null;
  fechaFinContrato?: string | null;
  tipo: 'inquilino';
}

@Component({
  selector: 'app-residentes-inquilinos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residentes-inquilinos.component.html',
  styleUrl: './residentes-inquilinos.component.css'
})
export class ResidentesInquilinosComponent implements OnInit {
  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
  fechaActual: string = '13 de Agosto de 2026';
  nombreBarrio: string = 'La Reserva Cardales';

  /** Pestaña activa en la barra de navegación inferior (el botón central corresponde a residentes) */
  tabActiva: 'inicio' | 'residentes' | 'ajustes' = 'residentes';

  /** Texto ingresado en el buscador superior */
  terminoBusqueda: string = '';

  /** Estado de carga preparado para la futura petición HTTP al backend */
  cargando: boolean = false;

  /** Endpoint preparado para conectar con el backend */
  private readonly apiEndpoint = '/api/residentes/inquilinos';

  /** Datos ficticios iniciales de prueba (preparados para ser reemplazados por el backend) */
  private readonly inquilinosMock: ResidenteInquilino[] = [
    {
      id: 101,
      nombre: 'Martin Diaz',
      lote: 15,
      telefono: '+5491143218765',
      email: 'martin.diaz@email.com',
      fechaInicioContrato: '2026-01-01',
      fechaFinContrato: '2027-12-31',
      tipo: 'inquilino'
    },
    {
      id: 102,
      nombre: 'Juan Gonzalez',
      lote: 42,
      telefono: '+5491154329876',
      email: 'juan.gonzalez@email.com',
      fechaInicioContrato: '2026-03-01',
      fechaFinContrato: '2028-02-28',
      tipo: 'inquilino'
    },
    {
      id: 103,
      nombre: 'Julieta Navarro',
      lote: 8,
      telefono: '+5491165430987',
      email: 'julieta.navarro@email.com',
      fechaInicioContrato: '2026-02-01',
      fechaFinContrato: '2027-01-31',
      tipo: 'inquilino'
    },
    {
      id: 104,
      nombre: 'Franco Roldán',
      lote: 19,
      telefono: '+5491176541098',
      email: 'franco.roldan@email.com',
      fechaInicioContrato: '2026-04-01',
      fechaFinContrato: '2028-03-31',
      tipo: 'inquilino'
    },
    {
      id: 105,
      nombre: 'Micaela Acosta',
      lote: 29,
      telefono: '+5491187652109',
      email: 'micaela.acosta@email.com',
      fechaInicioContrato: '2026-05-01',
      fechaFinContrato: '2027-04-30',
      tipo: 'inquilino'
    },
    {
      id: 106,
      nombre: 'Federico Villalba',
      lote: 36,
      telefono: '+5491198763210',
      email: 'federico.villalba@email.com',
      fechaInicioContrato: '2026-06-01',
      fechaFinContrato: '2028-05-31',
      tipo: 'inquilino'
    },
    {
      id: 107,
      nombre: 'Carolina Paz',
      lote: 51,
      telefono: '+5491132109876',
      email: 'carolina.paz@email.com',
      fechaInicioContrato: '2026-07-01',
      fechaFinContrato: '2027-06-30',
      tipo: 'inquilino'
    },
    {
      id: 108,
      nombre: 'Gonzalo Cabrera',
      lote: 73,
      telefono: '+5491121098765',
      email: 'gonzalo.cabrera@email.com',
      fechaInicioContrato: '2026-08-01',
      fechaFinContrato: '2028-07-31',
      tipo: 'inquilino'
    }
  ];

  /** Lista completa de inquilinos cargados */
  inquilinos: ResidenteInquilino[] = [];

  constructor(
    private router: Router,
    private residentesService: ResidentesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarInquilinos();
  }

  /**
   * Carga inicial de inquilinos.
   * Actualmente utiliza los datos ficticios de prueba (más altas locales de prueba)
   * y queda preparado para conectar con el backend mediante HttpClient o fetch(this.apiEndpoint).
   */
  cargarInquilinos(): void {
    this.cargando = true;

    // Cuando el backend esté disponible, reemplazar por:
    // this.http.get<ResidenteInquilino[]>(this.apiEndpoint).subscribe({
    //   next: (datos) => {
    //     this.inquilinos = datos;
    //     this.cargando = false;
    //   },
    //   error: (err) => {
    //     console.error('Error al obtener inquilinos del backend:', err);
    //     this.cargando = false;
    //   }
    // });

    this.residentesService.listarInquilinos().subscribe({
      next: (datos) => {
        const extras = this.obtenerInquilinosLocales();
        this.inquilinos = datos.length > 0
          ? datos.map((d) => ({ ...d, tipo: 'inquilino' as const }))
          : [...this.inquilinosMock, ...extras];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Error al obtener inquilinos del backend, usando datos locales:', err);
        const extras = this.obtenerInquilinosLocales();
        this.inquilinos = [...this.inquilinosMock, ...extras];
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private obtenerInquilinosLocales(): ResidenteInquilino[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const guardado = window.localStorage.getItem('zentry_inquilinos_extra');
        if (guardado) {
          return JSON.parse(guardado) as ResidenteInquilino[];
        }
      }
    } catch {
      // Ignorar errores de acceso a localStorage en SSR
    }
    return [];
  }

  /**
   * Filtra en tiempo real por nombre (ignorando tildes y mayúsculas)
   * o por número de lote (ej. "15" o "lote 15").
   */
  get inquilinosFiltrados(): ResidenteInquilino[] {
    const consulta = this.normalizarTexto(this.terminoBusqueda);
    if (!consulta) {
      return this.inquilinos;
    }

    return this.inquilinos.filter((inquilino) => {
      const nombreNormalizado = this.normalizarTexto(inquilino.nombre);
      const loteTexto = `lote ${inquilino.lote}`;
      const loteNumero = String(inquilino.lote);

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

  irAPropietarios(): void {
    void this.router.navigate(['/residentes-propietarios']);
  }

  /**
   * Abre WhatsApp Web / App para contactar directamente al inquilino seleccionado.
   */
  contactarPorWhatsapp(inquilino: ResidenteInquilino, event?: MouseEvent): void {
    event?.stopPropagation();

    const telefonoLimpio = inquilino.telefono.replace(/\D/g, '');
    const mensaje = `Hola ${inquilino.nombre} (Lote ${inquilino.lote}), te contactamos desde la administración de ${this.nombreBarrio}.`;
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

  trackByInquilinoId(_index: number, item: ResidenteInquilino): number {
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