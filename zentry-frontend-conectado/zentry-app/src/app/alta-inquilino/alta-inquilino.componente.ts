import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentesService } from '../services/residentes.service';
import { componerTelefono } from '../utils/residente-form.utils';
import { RouterLink } from '@angular/router';

export interface NuevoInquilino {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  password: string;
  lote: number;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  patentes: string[];
}

@Component({
  selector: 'app-alta-inquilino',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './alta-inquilino.componente.html',
  styleUrl: './alta-inquilino.componente.css'
})
export class AltaInquilinoComponent {
  @ViewChild('lotesDropdownList') lotesDropdownList?: ElementRef<HTMLUListElement>;

  readonly lotesBase = Array.from({ length: 100 }, (_, index) => index + 1);
  readonly calendarioDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly adminNombre = 'Valentina Canepa';
  readonly adminRol = 'Administradora';
  readonly fechaActual = '13 de Agosto de 2026';
  readonly nombreBarrio = 'La Reserva Cardales';

  inquilino = {
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    codigoPais: '+54',
    codigoArea: '',
    numeroLocal: '',
    password: '',
    lote: '',
    fechaInicioContrato: '',
    fechaFinContrato: ''
  };

  patentes: string[] = [''];
  loteFiltro = '';
  listaLotesAbierta = false;
  fechaInicioTexto = '';
  fechaFinTexto = '';
  calendarioAbierto: 'inicio' | 'fin' | null = null;
  mesVisible = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(private router: Router, private residentesService: ResidentesService) {}

  volverAPropietarios(): void {
    void this.router.navigate(['/alta-residentes']);
  }

  get lotesOrdenados(): number[] {
    const digitos = this.loteFiltro.replace(/\D/g, '').trim();
    if (!digitos) {
      return this.lotesBase;
    }

    const numeroBuscado = Number(digitos);
    const coincidenciaExacta: number[] = [];
    const empiezaCon: number[] = [];
    const contiene: number[] = [];
    const resto: number[] = [];

    for (const lote of this.lotesBase) {
      const loteStr = String(lote);
      if (lote === numeroBuscado) {
        coincidenciaExacta.push(lote);
      } else if (loteStr.startsWith(digitos)) {
        empiezaCon.push(lote);
      } else if (loteStr.includes(digitos)) {
        contiene.push(lote);
      } else {
        resto.push(lote);
      }
    }

    return [...coincidenciaExacta, ...empiezaCon, ...contiene, ...resto];
  }

  get numeroLoteDestacado(): number | null {
    const digitos = this.loteFiltro.replace(/\D/g, '').trim();
    if (!digitos) {
      return null;
    }
    const numero = Number(digitos);
    return numero >= 1 && numero <= 100 ? numero : null;
  }

  toggleListaLotes(event: MouseEvent): void {
    event.stopPropagation();
    this.listaLotesAbierta = !this.listaLotesAbierta;
    if (this.listaLotesAbierta) {
      this.resetScrollLotes();
    }
  }

  onFocusLote(): void {
    if (this.loteFiltro.startsWith('Lote ')) {
      this.loteFiltro = this.inquilino.lote;
    }
    this.listaLotesAbierta = true;
    this.resetScrollLotes();
  }

  onLoteInputChange(valor: string): void {
    this.loteFiltro = valor;
    this.inquilino.lote = valor.replace(/\D/g, '').trim();
    this.listaLotesAbierta = true;
    this.resetScrollLotes();
  }

  seleccionarLote(lote: number): void {
    this.inquilino.lote = String(lote);
    this.loteFiltro = `Lote ${lote}`;
    this.listaLotesAbierta = false;
  }

  private resetScrollLotes(): void {
    setTimeout(() => {
      if (this.lotesDropdownList?.nativeElement) {
        this.lotesDropdownList.nativeElement.scrollTop = 0;
      }
    }, 0);
  }

  actualizarFecha(tipo: 'inicio' | 'fin', valor: string): void {
    const fechaIso = this.convertirFechaAISO(valor);
    if (tipo === 'inicio') {
      this.fechaInicioTexto = valor;
      this.inquilino.fechaInicioContrato = fechaIso;
      return;
    }

    this.fechaFinTexto = valor;
    this.inquilino.fechaFinContrato = fechaIso;
  }

  get tituloMesVisible(): string {
    return new Intl.DateTimeFormat('es-AR', {
      month: 'long',
      year: 'numeric'
    }).format(this.mesVisible);
  }

  get diasDelCalendario(): Array<{
    fecha: string;
    numero: number;
    mesActual: boolean;
    deshabilitado: boolean;
    seleccionado: boolean;
    hoy: boolean;
  }> {
    const primerDiaMes = new Date(this.mesVisible.getFullYear(), this.mesVisible.getMonth(), 1);
    const desplazamiento = (primerDiaMes.getDay() + 6) % 7;
    const primerDiaVista = new Date(
      this.mesVisible.getFullYear(),
      this.mesVisible.getMonth(),
      1 - desplazamiento
    );
    const seleccionado = this.calendarioAbierto === 'inicio'
      ? this.inquilino.fechaInicioContrato
      : this.inquilino.fechaFinContrato;
    const hoy = this.formatearFechaISO(new Date());

    return Array.from({ length: 42 }, (_, indice) => {
      const fecha = new Date(
        primerDiaVista.getFullYear(),
        primerDiaVista.getMonth(),
        primerDiaVista.getDate() + indice
      );
      const fechaISO = this.formatearFechaISO(fecha);

      return {
        fecha: fechaISO,
        numero: fecha.getDate(),
        mesActual: fecha.getMonth() === this.mesVisible.getMonth(),
        deshabilitado: this.fechaDeshabilitada(fechaISO),
        seleccionado: fechaISO === seleccionado,
        hoy: fechaISO === hoy
      };
    });
  }

  abrirCalendario(tipo: 'inicio' | 'fin'): void {
    if (this.calendarioAbierto === tipo) {
      this.calendarioAbierto = null;
      return;
    }

    this.calendarioAbierto = tipo;
    const fechaSeleccionada = tipo === 'inicio'
      ? this.inquilino.fechaInicioContrato
      : this.inquilino.fechaFinContrato;
    const fechaBase = fechaSeleccionada || this.fechaMinima(tipo) || this.formatearFechaISO(new Date());
    const [anio, mes, dia] = fechaBase.split('-').map(Number);
    const fechaInicial = new Date(anio, mes - 1, dia);
    const limiteMinimo = this.fechaMinima(tipo);
    const limiteMaximo = this.fechaMaxima(tipo);

    if (limiteMinimo && fechaBase < limiteMinimo) {
      const [anioMinimo, mesMinimo] = limiteMinimo.split('-').map(Number);
      this.mesVisible = new Date(anioMinimo, mesMinimo - 1, 1);
      return;
    }

    if (limiteMaximo && fechaBase > limiteMaximo) {
      const [anioMaximo, mesMaximo] = limiteMaximo.split('-').map(Number);
      this.mesVisible = new Date(anioMaximo, mesMaximo - 1, 1);
      return;
    }

    this.mesVisible = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), 1);
  }

  cambiarMes(cantidad: number): void {
    const nuevoMes = new Date(this.mesVisible.getFullYear(), this.mesVisible.getMonth() + cantidad, 1);
    const primerDiaMes = this.formatearFechaISO(nuevoMes);
    const ultimoDiaMes = this.formatearFechaISO(
      new Date(nuevoMes.getFullYear(), nuevoMes.getMonth() + 1, 0)
    );
    const limiteMinimo = this.calendarioAbierto ? this.fechaMinima(this.calendarioAbierto) : '';
    const limiteMaximo = this.calendarioAbierto ? this.fechaMaxima(this.calendarioAbierto) : '';

    if (
      (limiteMinimo && ultimoDiaMes < limiteMinimo) ||
      (limiteMaximo && primerDiaMes > limiteMaximo)
    ) {
      return;
    }
    this.mesVisible = nuevoMes;
  }

  seleccionarDia(fecha: string): void {
    if (!this.calendarioAbierto || this.fechaDeshabilitada(fecha)) {
      return;
    }

    const [anio, mes, dia] = fecha.split('-');
    this.actualizarFecha(this.calendarioAbierto, `${dia}/${mes}/${anio}`);
    this.calendarioAbierto = null;
  }

  mesAnteriorDeshabilitado(): boolean {
    if (!this.calendarioAbierto) {
      return true;
    }
    const ultimoDiaMesAnterior = this.formatearFechaISO(
      new Date(this.mesVisible.getFullYear(), this.mesVisible.getMonth(), 0)
    );
    const limiteMinimo = this.fechaMinima(this.calendarioAbierto);
    return !!limiteMinimo && ultimoDiaMesAnterior < limiteMinimo;
  }

  mesSiguienteDeshabilitado(): boolean {
    if (!this.calendarioAbierto) {
      return true;
    }
    const primerDiaMesSiguiente = this.formatearFechaISO(
      new Date(this.mesVisible.getFullYear(), this.mesVisible.getMonth() + 1, 1)
    );
    const limiteMaximo = this.fechaMaxima(this.calendarioAbierto);
    return !!limiteMaximo && primerDiaMesSiguiente > limiteMaximo;
  }

  @HostListener('document:click', ['$event'])
  cerrarDesplegablesAlHacerClickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.lote-select-container')) {
      this.listaLotesAbierta = false;
      if (this.inquilino.lote && !this.loteFiltro.startsWith('Lote ')) {
        this.loteFiltro = `Lote ${this.inquilino.lote}`;
      }
    }
    if (!target?.closest('.date-field')) {
      this.calendarioAbierto = null;
    }
  }

  @HostListener('document:keydown.escape')
  cerrarDesplegablesConEscape(): void {
    this.listaLotesAbierta = false;
    this.calendarioAbierto = null;
  }

  private fechaDeshabilitada(fecha: string): boolean {
    if (!this.calendarioAbierto) {
      return false;
    }
    const minimo = this.fechaMinima(this.calendarioAbierto);
    const maximo = this.fechaMaxima(this.calendarioAbierto);
    return (!!minimo && fecha < minimo) || (!!maximo && fecha > maximo);
  }

  private fechaMinima(tipo: 'inicio' | 'fin'): string {
    return tipo === 'fin' ? this.inquilino.fechaInicioContrato : '';
  }

  private fechaMaxima(tipo: 'inicio' | 'fin'): string {
    return tipo === 'inicio' ? this.inquilino.fechaFinContrato : '';
  }

  private formatearFechaISO(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private convertirFechaAISO(valor: string): string {
    const coincidencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
    if (!coincidencia) {
      return '';
    }

    const [, dia, mes, anio] = coincidencia;
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    if (
      fecha.getFullYear() !== Number(anio) ||
      fecha.getMonth() !== Number(mes) - 1 ||
      fecha.getDate() !== Number(dia)
    ) {
      return '';
    }
    return `${anio}-${mes}-${dia}`;
  }

  agregarPatente(): void {
    this.patentes.push('');
  }

  quitarPatente(index: number): void {
    if (index > 0 && index < this.patentes.length) {
      this.patentes.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  cancelar(): void {
    void this.router.navigate(['/alta-residentes']);
  }

  darAlta(): void {
    const nombre = this.inquilino.nombre.trim();
    const apellido = this.inquilino.apellido.trim();
    const dni = this.inquilino.dni.trim();
    const email = this.inquilino.email.trim();
    const codigoPais = this.inquilino.codigoPais.replace(/\D/g, '');
    const codigoArea = this.inquilino.codigoArea.replace(/\D/g, '');
    const numeroLocal = this.inquilino.numeroLocal.replace(/\D/g, '');
    const password = this.inquilino.password.trim();
    const telefono = componerTelefono(codigoPais, codigoArea, numeroLocal);
    const numeroLote = Number(this.inquilino.lote);
    const { fechaInicioContrato, fechaFinContrato } = this.inquilino;

    if (
      !nombre || !apellido || !dni || !email || !codigoPais || !codigoArea || !numeroLocal ||
      !password ||
      !this.inquilino.lote || !fechaInicioContrato || !fechaFinContrato
    ) {
      alert('Por favor, completá todos los datos, la contraseña y las fechas del contrato.');
      return;
    }

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (codigoPais.length > 3 || codigoArea.length < 2 || codigoArea.length > 4 ||
        numeroLocal.length < 6 || numeroLocal.length > 10) {
      alert('Revisá el código de país, el código de área y el número de teléfono.');
      return;
    }

    if (!Number.isInteger(numeroLote) || numeroLote < 1 || numeroLote > 100) {
      alert('Por favor, seleccioná un lote válido del 1 al 100.');
      return;
    }

    if (fechaFinContrato < fechaInicioContrato) {
      alert('La fecha de fin del contrato debe ser posterior a la fecha de inicio.');
      return;
    }

    const payload: NuevoInquilino = {
      nombre,
      apellido,
      dni,
      email,
      telefono,
      password,
      lote: numeroLote,
      fechaInicioContrato,
      fechaFinContrato,
      patentes: this.patentes
        .map((patente) => patente.trim().toUpperCase())
        .filter((patente) => patente.length > 0)
    };

    this.residentesService.crearResidente({
      tipo: 'inquilino',
      nombre,
      apellido,
      dni,
      email,
      telefono,
      password,
      lote_numero: numeroLote,
      fechaInicioContrato,
      fechaFinContrato,
      patentes: payload.patentes
    }).subscribe({
      next: (creado) => {
        console.log('Alta de inquilino guardada en BD:', creado);
        void this.router.navigate(['/editar-residentes']);
      },
      error: (err) => {
        console.warn('No se pudo guardar el alta del inquilino:', err);
        alert(err.error?.email?.[0] || err.error?.password?.[0] ||
          'No se pudo crear el inquilino. Revisá que el email no esté registrado e intentá nuevamente.');
      }
    });
  }
}