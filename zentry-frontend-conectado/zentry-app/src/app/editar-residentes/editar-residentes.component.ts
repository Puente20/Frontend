import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentesService } from '../services/residentes.service';

interface Residente {
  id: number;
  nombre: string;
  lote: number;
  telefono: string;
  tipo: 'propietario' | 'inquilino';
  apellido?: string;
  email?: string;
  dni?: string;
  rolPropiedad?: 'titular' | 'conviviente';
  patentes?: string[];
}

@Component({
  selector: 'app-editar-residentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-residentes.component.html',
  styleUrl: './editar-residentes.component.css'
})
export class EditarResidentesComponent implements OnInit {
  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
  fechaActual: string = '13 de Agosto de 2026';
  nombreBarrio: string = 'La Reserva Cardales';

  tabActiva: 'inicio' | 'residentes' | 'ajustes' = 'inicio';
  terminoBusqueda: string = '';
  cargando: boolean = false;
  residenteEditando: Residente | null = null;
  formularioEdicion = this.formularioVacio();
  errorEdicion: string = '';
  readonly lotesDisponibles = Array.from({ length: 100 }, (_, index) => index + 1);
  menuDesplegable: 'tipo' | 'lote' | 'rolPropiedad' | null = null;
  private telefonoConPrefijoMovil = false;

  private readonly propietariosMock: Residente[] = [
    { id: 1, nombre: 'Valentina Canepa', lote: 3, telefono: '+5491143218765', tipo: 'propietario' },
    { id: 2, nombre: 'Santiago Perez', lote: 12, telefono: '+5491154329876', tipo: 'propietario' },
    { id: 3, nombre: 'Maria Rodriguez', lote: 18, telefono: '+5491165430987', tipo: 'propietario' },
    { id: 4, nombre: 'Lucas Fernandez', lote: 27, telefono: '+5491176541098', tipo: 'propietario' },
    { id: 5, nombre: 'Camila Martinez', lote: 34, telefono: '+5491187652109', tipo: 'propietario' },
    { id: 6, nombre: 'Nicolas Gomez', lote: 46, telefono: '+5491198763210', tipo: 'propietario' },
    { id: 7, nombre: 'Florencia Lopez', lote: 62, telefono: '+5491132109876', tipo: 'propietario' },
    { id: 8, nombre: 'Agustin Torres', lote: 81, telefono: '+5491121098765', tipo: 'propietario' }
  ];

  private readonly inquilinosMock: Residente[] = [
    { id: 101, nombre: 'Martin Diaz', lote: 15, telefono: '+5491143218765', tipo: 'inquilino' },
    { id: 102, nombre: 'Juan Gonzalez', lote: 42, telefono: '+5491154329876', tipo: 'inquilino' },
    { id: 103, nombre: 'Julieta Navarro', lote: 8, telefono: '+5491165430987', tipo: 'inquilino' },
    { id: 104, nombre: 'Franco Roldán', lote: 19, telefono: '+5491176541098', tipo: 'inquilino' },
    { id: 105, nombre: 'Micaela Acosta', lote: 29, telefono: '+5491187652109', tipo: 'inquilino' },
    { id: 106, nombre: 'Federico Villalba', lote: 36, telefono: '+5491198763210', tipo: 'inquilino' },
    { id: 107, nombre: 'Carolina Paz', lote: 51, telefono: '+5491132109876', tipo: 'inquilino' },
    { id: 108, nombre: 'Gonzalo Cabrera', lote: 73, telefono: '+5491121098765', tipo: 'inquilino' }
  ];

  residentes: Residente[] = [];

  constructor(private router: Router, private residentesService: ResidentesService) {}

  ngOnInit(): void {
    this.cargarResidentes();
  }

  cargarResidentes(): void {
    this.cargando = true;
    this.residentesService.listarTodos().subscribe({
      next: (remotos) => {
        if (remotos.length > 0) {
          this.residentes = remotos as Residente[];
          this.cargando = false;
          return;
        }
        this.cargarResidentesLocalesFallback();
      },
      error: () => {
        this.cargarResidentesLocalesFallback();
      }
    });
  }

  private cargarResidentesLocalesFallback(): void {
    const residentesBase = [
      ...this.propietariosMock,
      ...this.inquilinosMock,
      ...this.obtenerInquilinosLocales()
    ];

    if (typeof window === 'undefined') {
      this.residentes = residentesBase;
      this.cargando = false;
      return;
    }

    try {
      const guardados = window.localStorage.getItem('zentry_residentes_editados');
      const residentesEditados = guardados ? JSON.parse(guardados) as Residente[] : [];
      const edicionesPorId = new Map(
        residentesEditados.map((residente) => [this.obtenerClaveResidente(residente), residente])
      );
      this.residentes = residentesBase.map((residente) =>
        edicionesPorId.get(this.obtenerClaveResidente(residente)) ?? residente
      );
    } catch (error) {
      console.error('No se pudieron cargar los residentes editados:', error);
      this.residentes = residentesBase;
      this.errorEdicion = 'No se pudieron recuperar los cambios guardados.';
    }
    this.cargando = false;
  }

  get residentesFiltrados(): Residente[] {
    const consulta = this.normalizarTexto(this.terminoBusqueda);
    if (!consulta) {
      return this.residentes;
    }

    return this.residentes.filter((residente) => {
      const nombreNormalizado = this.normalizarTexto(residente.nombre);
      const loteTexto = `lote ${residente.lote}`;
      const tipoNormalizado = this.normalizarTexto(residente.tipo);

      return (
        nombreNormalizado.includes(consulta) ||
        loteTexto.includes(consulta) ||
        String(residente.lote).includes(consulta) ||
        tipoNormalizado.includes(consulta)
      );
    });
  }

  onBuscarChange(valor: string): void {
    this.terminoBusqueda = valor;
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
  }

  abrirEdicion(residente: Residente): void {
    const partesNombre = residente.nombre.trim().split(/\s+/);
    const nombre = partesNombre.shift() ?? '';
    const telefono = this.separarTelefono(residente.telefono);
    this.telefonoConPrefijoMovil = telefono.prefijoMovil;
    this.residenteEditando = residente;
    this.formularioEdicion = {
      nombre,
      apellido: residente.apellido ?? partesNombre.join(' '),
      codigoPais: telefono.codigoPais,
      codigoArea: telefono.codigoArea,
      numeroLocal: telefono.numeroLocal,
      email: residente.email ?? '',
      tipo: residente.tipo,
      lote: residente.lote,
      rolPropiedad: residente.rolPropiedad ?? 'titular',
      patentes: residente.patentes?.length ? [...residente.patentes] : ['']
    };
    this.errorEdicion = '';
  }

  cerrarEdicion(): void {
    this.residenteEditando = null;
    this.errorEdicion = '';
    this.menuDesplegable = null;
  }

  alternarDesplegable(menu: 'tipo' | 'lote' | 'rolPropiedad', event: MouseEvent): void {
    event.stopPropagation();
    this.menuDesplegable = this.menuDesplegable === menu ? null : menu;
  }

  seleccionarTipo(tipo: 'propietario' | 'inquilino'): void {
    this.formularioEdicion.tipo = tipo;
    this.menuDesplegable = null;
  }

  seleccionarLote(lote: number): void {
    this.formularioEdicion.lote = lote;
    this.menuDesplegable = null;
  }

  seleccionarRolPropiedad(rol: 'titular' | 'conviviente'): void {
    this.formularioEdicion.rolPropiedad = rol;
    this.menuDesplegable = null;
  }

  agregarPatente(): void {
    this.formularioEdicion.patentes.push('');
  }

  quitarPatente(index: number): void {
    if (this.formularioEdicion.patentes.length > 1) {
      this.formularioEdicion.patentes.splice(index, 1);
    }
  }

  guardarEdicion(): void {
    if (!this.residenteEditando) {
      return;
    }

    const nombre = this.formularioEdicion.nombre.trim();
    const apellido = this.formularioEdicion.apellido.trim();
    const codigoPais = this.formularioEdicion.codigoPais.replace(/\D/g, '');
    const codigoArea = this.formularioEdicion.codigoArea.replace(/\D/g, '');
    const numeroLocal = this.formularioEdicion.numeroLocal.replace(/\D/g, '');
    const telefono = `+${codigoPais}${this.telefonoConPrefijoMovil ? '9' : ''}${codigoArea}${numeroLocal}`;
    const email = this.formularioEdicion.email.trim();
    const lote = Number(this.formularioEdicion.lote);

    if (!nombre || !apellido || !codigoPais || !codigoArea || !numeroLocal || !email) {
      this.errorEdicion = 'Completá nombre, apellido, las tres partes del teléfono y email.';
      return;
    }
    if (codigoPais.length > 3 || codigoArea.length < 2 || codigoArea.length > 4 ||
        numeroLocal.length < 6 || numeroLocal.length > 10) {
      this.errorEdicion = 'Revisá el código de país, el código de área y el número.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorEdicion = 'Ingresá una dirección de email válida.';
      return;
    }
    if (!Number.isInteger(lote) || lote < 1 || lote > 100) {
      this.errorEdicion = 'Seleccioná un lote válido del 1 al 100.';
      return;
    }

    const residenteActualizado: Residente = {
      ...this.residenteEditando,
      nombre: `${nombre} ${apellido}`,
      apellido,
      telefono,
      email,
      tipo: this.formularioEdicion.tipo,
      lote,
      rolPropiedad: this.formularioEdicion.rolPropiedad,
      patentes: this.formularioEdicion.patentes
        .map((patente) => patente.trim().toUpperCase())
        .filter((patente) => patente.length > 0)
    };
    const residentesActualizados = this.residentes.map((residente) =>
      this.obtenerClaveResidente(residente) === this.obtenerClaveResidente(residenteActualizado)
        ? residenteActualizado
        : residente
    );

    this.residentesService.actualizarResidente(residenteActualizado.id, {
      nombre,
      apellido,
      telefono,
      email,
      tipo: this.formularioEdicion.tipo,
      lote_numero: lote,
      rolPropiedad: this.formularioEdicion.rolPropiedad,
      patentes: residenteActualizado.patentes ?? []
    }).subscribe({
      next: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('zentry_residentes_editados', JSON.stringify(residentesActualizados));
        }
        this.residentes = residentesActualizados;
        this.cerrarEdicion();
      },
      error: () => {
        try {
          window.localStorage.setItem('zentry_residentes_editados', JSON.stringify(residentesActualizados));
          this.residentes = residentesActualizados;
          this.cerrarEdicion();
        } catch (error) {
          console.error('No se pudieron guardar los cambios del residente:', error);
          this.errorEdicion = 'No se pudieron guardar los cambios. Intentá nuevamente.';
        }
      }
    });
  }

  cambiarTabNav(tab: 'inicio' | 'residentes' | 'ajustes'): void {
    this.tabActiva = tab;
    if (tab === 'inicio') {
      void this.router.navigate(['/admin-home']);
      return;
    }
    if (tab === 'residentes') {
      void this.router.navigate(['/residentes-propietarios']);
      return;
    }
    if (tab === 'ajustes') {
      void this.router.navigate(['/admin-home'], { queryParams: { tab: 'ajustes' } });
    }
  }

  trackByResidenteId(_index: number, residente: Residente): string {
    return `${residente.tipo}-${residente.id}`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private obtenerInquilinosLocales(): Residente[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const guardado = window.localStorage.getItem('zentry_inquilinos_extra');
      return guardado ? JSON.parse(guardado) as Residente[] : [];
    } catch (error) {
      console.error('No se pudieron cargar los inquilinos guardados localmente:', error);
      return [];
    }
  }

  private formularioVacio(): {
    nombre: string;
    apellido: string;
    codigoPais: string;
    codigoArea: string;
    numeroLocal: string;
    email: string;
    tipo: 'propietario' | 'inquilino';
    lote: number;
    rolPropiedad: 'titular' | 'conviviente';
    patentes: string[];
  } {
    return {
      nombre: '',
      apellido: '',
      codigoPais: '+54',
      codigoArea: '',
      numeroLocal: '',
      email: '',
      tipo: 'propietario',
      lote: 1,
      rolPropiedad: 'titular',
      patentes: ['']
    };
  }

  private obtenerClaveResidente(residente: Residente): string {
    return String(residente.id);
  }

  private separarTelefono(telefono: string): {
    codigoPais: string;
    codigoArea: string;
    numeroLocal: string;
    prefijoMovil: boolean;
  } {
    const digitos = telefono.replace(/\D/g, '');
    const comienzaConCodigoArgentino = digitos.startsWith('54');
    const codigoPais = '+54';
    let nacional = comienzaConCodigoArgentino ? digitos.slice(2) : digitos;
    const prefijoMovil = nacional.startsWith('9');

    if (prefijoMovil) {
      nacional = nacional.slice(1);
    }

    let longitudArea = 3;
    if (nacional.startsWith('11')) {
      longitudArea = 2;
    } else if (nacional.startsWith('3489')) {
      longitudArea = 4;
    }

    return {
      codigoPais,
      codigoArea: nacional.slice(0, longitudArea),
      numeroLocal: nacional.slice(longitudArea),
      prefijoMovil
    };
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}