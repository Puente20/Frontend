import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvitacionStorageService } from '../invitaciones-activas/invitacion-storage.service';

@Component({
  selector: 'app-generate-qr-concurrente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generateqr2.component.html',
  styleUrl: './generateqr2.component.css'
})
export class GenerateQr2Component {
  readonly fechaActual = '13 de Agosto de 2026';
  readonly calendarioDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly diasSemana = [
    { valor: 'lunes', etiqueta: 'Lunes' },
    { valor: 'martes', etiqueta: 'Martes' },
    { valor: 'miercoles', etiqueta: 'Miércoles' },
    { valor: 'jueves', etiqueta: 'Jueves' },
    { valor: 'viernes', etiqueta: 'Viernes' },
    { valor: 'sabado', etiqueta: 'Sábado' },
    { valor: 'domingo', etiqueta: 'Domingo' }
  ];
  readonly diasFilaSuperior = this.diasSemana.slice(0, 3);
  readonly diasFilaInferior = this.diasSemana.slice(3);

  tipoInvitacion: 'unica' | 'concurrente' = 'concurrente';
  private navigationTimer?: ReturnType<typeof setTimeout>;
  diasSeleccionados = this.diasSemana.map((dia) => dia.valor);

  invitacion = {
    nombreVisitante: '',
    dni: '',
    fechaInicio: '',
    fechaFin: ''
  };
  fechaInicioTexto = '';
  fechaFinTexto = '';
  calendarioAbierto: 'inicio' | 'fin' | null = null;
  mesVisible = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mensajeError = '';

  constructor(
    private router: Router,
    private invitacionStorage: InvitacionStorageService
  ) {}

  seleccionarTipo(tipo: 'unica' | 'concurrente'): void {
    if (tipo === 'unica') {
      this.tipoInvitacion = tipo;
      this.navegarLuego('/generar-qr');
      return;
    }

    this.tipoInvitacion = tipo;
  }

  private navegarLuego(ruta: string): void {
    clearTimeout(this.navigationTimer);
    this.navigationTimer = setTimeout(() => {
      void this.router.navigate([ruta]);
    }, 400);
  }

  cambiarDia(dia: string, event: Event): void {
    const seleccionado = (event.target as HTMLInputElement).checked;
    this.diasSeleccionados = seleccionado
      ? [...this.diasSeleccionados, dia]
      : this.diasSeleccionados.filter((diaSeleccionado) => diaSeleccionado !== dia);
  }

  actualizarFecha(tipo: 'inicio' | 'fin', valor: string): void {
    const fechaIso = this.convertirFechaAISO(valor);
    if (tipo === 'inicio') {
      this.fechaInicioTexto = valor;
      this.invitacion.fechaInicio = fechaIso;
      return;
    }

    this.fechaFinTexto = valor;
    this.invitacion.fechaFin = fechaIso;
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
    const primerDiaMes = new Date(
      this.mesVisible.getFullYear(),
      this.mesVisible.getMonth(),
      1
    );
    const desplazamiento = (primerDiaMes.getDay() + 6) % 7;
    const primerDiaVista = new Date(
      this.mesVisible.getFullYear(),
      this.mesVisible.getMonth(),
      1 - desplazamiento
    );
    const seleccionado = this.calendarioAbierto
      ? this.invitacion[this.calendarioAbierto === 'inicio' ? 'fechaInicio' : 'fechaFin']
      : '';
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
      ? this.invitacion.fechaInicio
      : this.invitacion.fechaFin;
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
    const nuevoMes = new Date(
      this.mesVisible.getFullYear(),
      this.mesVisible.getMonth() + cantidad,
      1
    );
    const primerDiaMes = this.formatearFechaISO(nuevoMes);
    const ultimoDiaMes = this.formatearFechaISO(
      new Date(nuevoMes.getFullYear(), nuevoMes.getMonth() + 1, 0)
    );
    const limiteMinimo = this.calendarioAbierto
      ? this.fechaMinima(this.calendarioAbierto)
      : '';
    const limiteMaximo = this.calendarioAbierto
      ? this.fechaMaxima(this.calendarioAbierto)
      : '';

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
  cerrarCalendarioAlHacerClickFuera(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.date-field')) {
      this.calendarioAbierto = null;
    }
  }

  @HostListener('document:keydown.escape')
  cerrarCalendarioConEscape(): void {
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
    return tipo === 'fin' ? this.invitacion.fechaInicio : '';
  }

  private fechaMaxima(tipo: 'inicio' | 'fin'): string {
    return tipo === 'inicio' ? this.invitacion.fechaFin : '';
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

  volver(): void {
    this.router.navigate(['/resident-home']);
  }

  generarQR(): void {
    if (
      !this.invitacion.nombreVisitante.trim() ||
      !this.invitacion.dni.trim() ||
      !this.invitacion.fechaInicio ||
      !this.invitacion.fechaFin ||
      this.diasSeleccionados.length === 0
    ) {
      alert('Completa los campos y selecciona al menos un día.');
      return;
    }

    if (this.invitacion.fechaFin < this.invitacion.fechaInicio) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    this.mensajeError = '';
    try {
      this.invitacionStorage.guardar({
      tipo: this.tipoInvitacion,
      ...this.invitacion,
      dias: this.diasSeleccionados
      });
      void this.router.navigate(['/invitaciones-activas']);
    } catch (error: unknown) {
      this.mensajeError = error instanceof Error
        ? error.message
        : 'No se pudo guardar la invitación.';
    }
  }
}