import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservasService } from '../services/reservas.service';
import { ActivityLogService } from '../services/activity-log.service';

export interface InstalacionBarrio {
  id: string;
  nombre: string;
  duracionMinutos: number | null;
  duracionTexto: string;
  maxPersonas: number;
  horaApertura: number;
  horaCierre: number;
  esDiaCompleto: boolean;
  esCapacidadVariablePorBarrio: boolean;
  tipoAccion: 'confirmar' | 'senar';
}

export interface DiaCalendarioReserva {
  fecha: string;
  numero: number;
  mesActual: boolean;
  seleccionado: boolean;
  hoy: boolean;
  fechaPasada: boolean;
}

export interface SolicitudReserva {
  instalacionId: string;
  instalacionNombre: string;
  fecha: string;
  horario: string;
  cantidadMaximaPersonas: number;
  tipoOperacion: 'confirmar' | 'senar';
}

@Component({
  selector: 'nueva-reserva, app-nueva-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reserva.component.html',
  styleUrl: './nueva-reserva.component.css'
})
export class NuevaReservaComponent implements OnInit {
  readonly fechaActual: string = '13 de agosto de 2026';
  readonly calendarioDias: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly loteResidenteActual: string = 'Lote 1';

  /** Endpoint preparado para obtener las instalaciones configuradas según el barrio desde el backend */
  private readonly apiInstalacionesEndpoint = '/api/barrios/instalaciones';

  /** Endpoint preparado para registrar la reserva o seña en el backend */
  private readonly apiReservasEndpoint = '/api/reservas';

  /**
   * Capacidad máxima del SUM configurable según el barrio (por defecto 100 personas).
   * Cuando se conecte al backend, este valor se actualiza con la configuración del barrio.
   */
  maximoPersonasSumBarrio: number = 100;

  /**
   * Lista de instalaciones disponibles en el barrio (preparada para venir del backend).
   * Las canchas operan de 09:00 a 00:00 (9am a 12pm/medianoche) según la duración de su turno.
   */
  instalacionesDisponibles: InstalacionBarrio[] = [];

  /** Instalación actualmente seleccionada en la lista desplegable */
  instalacionSeleccionada!: InstalacionBarrio;

  /** Controla la apertura de la lista desplegable de instalaciones */
  listaInstalacionesAbierta: boolean = false;

  /** Mes visible en el calendario */
  mesVisible: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  /** Fecha seleccionada en formato ISO (YYYY-MM-DD) */
  fechaSeleccionadaISO: string = this.formatearFechaISO(new Date());

  /** Lista de rangos horarios generados dinámicamente según la instalación elegida */
  rangosHorarios: string[] = [];

  /** Rango horario seleccionado por el residente */
  horarioSeleccionado: string = '';

  /** Mensaje de confirmación tras enviar la reserva o seña */
  mensajeConfirmacion: string = '';
  mensajeErrorReserva: string = '';
  procesandoReserva = false;

  constructor(
    private router: Router,
    private reservasService: ReservasService,
    private activityLog: ActivityLogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarInstalacionesDelBarrio();
  }

  /**
   * Carga las instalaciones del barrio.
   * Queda preparado para conectarse al backend y recibir las instalaciones y capacidades de cada barrio.
   */
  cargarInstalacionesDelBarrio(): void {
    this.reservasService.obtenerInstalaciones().subscribe({
      next: (instalaciones) => {
        if (instalaciones && instalaciones.length > 0) {
          this.instalacionesDisponibles = instalaciones;
          this.seleccionarInstalacion(this.instalacionesDisponibles[0]);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.warn('Usando instalaciones locales por defecto:', err);
        this.cdr.markForCheck();
      }
    });

    this.instalacionesDisponibles = [
      {
        id: 'cancha-tenis',
        nombre: 'Cancha de Tenis',
        duracionMinutos: 60,
        duracionTexto: '1 hs por turno',
        maxPersonas: 4,
        horaApertura: 9,
        horaCierre: 24,
        esDiaCompleto: false,
        esCapacidadVariablePorBarrio: false,
        tipoAccion: 'confirmar'
      },
      {
        id: 'cancha-padel',
        nombre: 'Cancha de Padel',
        duracionMinutos: 90,
        duracionTexto: '1:30 hs por turno',
        maxPersonas: 4,
        horaApertura: 9,
        horaCierre: 24,
        esDiaCompleto: false,
        esCapacidadVariablePorBarrio: false,
        tipoAccion: 'confirmar'
      },
      {
        id: 'cancha-futbol-5',
        nombre: 'Cancha de Fútbol 5',
        duracionMinutos: 60,
        duracionTexto: '1 hs por turno',
        maxPersonas: 10,
        horaApertura: 9,
        horaCierre: 24,
        esDiaCompleto: false,
        esCapacidadVariablePorBarrio: false,
        tipoAccion: 'confirmar'
      },
      {
        id: 'sum',
        nombre: 'SUM',
        duracionMinutos: null,
        duracionTexto: 'Todo el día',
        maxPersonas: this.maximoPersonasSumBarrio,
        horaApertura: 9,
        horaCierre: 24,
        esDiaCompleto: true,
        esCapacidadVariablePorBarrio: true,
        tipoAccion: 'senar'
      }
    ];

    this.seleccionarInstalacion(this.instalacionesDisponibles[0]);
  }

  toggleListaInstalaciones(event: MouseEvent): void {
    event.stopPropagation();
    this.listaInstalacionesAbierta = !this.listaInstalacionesAbierta;
  }

  /**
   * Al cambiar la instalación en la lista desplegable:
   * - Recalcula los rangos horarios desde las 09:00 hasta las 00:00 según la duración del turno.
   * - Actualiza el máximo de personas (4, 4, 10 o 100 para el SUM).
   * - Cambia el botón final entre "Confirmar Reserva" y "Señar".
   */
  seleccionarInstalacion(instalacion: InstalacionBarrio): void {
    this.instalacionSeleccionada = instalacion;
    this.listaInstalacionesAbierta = false;
    this.mensajeConfirmacion = '';
    this.generarRangosHorarios(instalacion);
  }

  /**
   * Genera dinámicamente los turnos desde las 9:00 AM hasta las 12:00 PM (medianoche / 00:00)
   * según la duración en minutos de la instalación seleccionada (60 min, 90 min o Todo el día).
   */
  private generarRangosHorarios(instalacion: InstalacionBarrio): void {
    if (instalacion.esDiaCompleto || !instalacion.duracionMinutos) {
      this.rangosHorarios = ['Todo el día (09:00 - 00:00)'];
      this.horarioSeleccionado = this.rangosHorarios[0];
      return;
    }

    const rangos: string[] = [];
    const inicioMinutos = instalacion.horaApertura * 60; // 09:00 = 540 min
    const finMinutos = instalacion.horaCierre * 60;      // 24:00 = 1440 min
    const paso = instalacion.duracionMinutos;

    for (let actual = inicioMinutos; actual + paso <= finMinutos; actual += paso) {
      const horaInicio = this.formatearMinutosAHora(actual);
      const horaFin = this.formatearMinutosAHora(actual + paso);
      rangos.push(`${horaInicio} - ${horaFin}`);
    }

    this.rangosHorarios = rangos;
    this.horarioSeleccionado = rangos[0] || '';
  }

  private formatearMinutosAHora(totalMinutos: number): string {
    const minutosNormalizados = totalMinutos === 1440 ? 0 : totalMinutos;
    const horas = Math.floor(minutosNormalizados / 60);
    const minutos = minutosNormalizados % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }

  seleccionarHorario(rango: string): void {
    this.horarioSeleccionado = rango;
    this.mensajeConfirmacion = '';
  }

  get tituloMesVisible(): string {
    const mes = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(this.mesVisible);
    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
    return `${mesCapitalizado} De ${this.mesVisible.getFullYear()}`;
  }

  get diasDelCalendario(): DiaCalendarioReserva[] {
    const anio = this.mesVisible.getFullYear();
    const mes = this.mesVisible.getMonth();
    const primerDiaMes = new Date(anio, mes, 1);
    const desplazamientoLunes = (primerDiaMes.getDay() + 6) % 7;
    const primerDiaGrilla = new Date(anio, mes, 1 - desplazamientoLunes);
    const hoyISO = this.formatearFechaISO(new Date());

    const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
    const totalCeldas = desplazamientoLunes + ultimoDiaMes > 35 ? 42 : 35;

    return Array.from({ length: totalCeldas }, (_, indice) => {
      const fecha = new Date(
        primerDiaGrilla.getFullYear(),
        primerDiaGrilla.getMonth(),
        primerDiaGrilla.getDate() + indice
      );
      const fechaISO = this.formatearFechaISO(fecha);

      return {
        fecha: fechaISO,
        numero: fecha.getDate(),
        mesActual: fecha.getMonth() === mes,
        seleccionado: fechaISO === this.fechaSeleccionadaISO,
        hoy: fechaISO === hoyISO,
        fechaPasada: fechaISO < hoyISO
      };
    });
  }

  cambiarMes(direccion: number): void {
    this.mesVisible = new Date(
      this.mesVisible.getFullYear(),
      this.mesVisible.getMonth() + direccion,
      1
    );
  }

  seleccionarFecha(dia: DiaCalendarioReserva): void {
    if (dia.fechaPasada) {
      return;
    }

    this.fechaSeleccionadaISO = dia.fecha;
    this.mensajeConfirmacion = '';

    if (!dia.mesActual) {
      const [anio, mes] = dia.fecha.split('-').map(Number);
      this.mesVisible = new Date(anio, mes - 1, 1);
    }
  }

  get textoBotonPrincipal(): string {
    return this.instalacionSeleccionada?.tipoAccion === 'senar'
      ? 'Señar'
      : 'Confirmar Reserva';
  }

  /**
   * Confirma la reserva de cancha o registra la seña del SUM,
   * la agrega en la lista de "Últimos movimientos" del residente y redirige a /resident-home.
   */
  procesarReserva(): void {
    if (
      this.procesandoReserva ||
      !this.instalacionSeleccionada ||
      !this.fechaSeleccionadaISO ||
      !this.horarioSeleccionado
    ) {
      return;
    }

    this.mensajeErrorReserva = '';
    this.mensajeConfirmacion = '';
    this.procesandoReserva = true;

    const payload: SolicitudReserva = {
      instalacionId: this.instalacionSeleccionada.id,
      instalacionNombre: this.instalacionSeleccionada.nombre,
      fecha: this.fechaSeleccionadaISO,
      horario: this.horarioSeleccionado,
      cantidadMaximaPersonas: this.instalacionSeleccionada.maxPersonas,
      tipoOperacion: this.instalacionSeleccionada.tipoAccion
    };

    this.reservasService.crearReserva(payload).subscribe({
      next: (movimientoGuardado) => {
        this.procesandoReserva = false;
        console.log('Reserva registrada en BD:', movimientoGuardado);
        const [anio, mes, dia] = this.fechaSeleccionadaISO.split('-');
        const fechaFormateada = `${dia}/${mes}/${anio}`;
        const esSum = this.instalacionSeleccionada.id === 'sum' ||
          this.instalacionSeleccionada.tipoAccion === 'senar';
        this.activityLog.registrar({
          tipo: 'reserva',
          descripcion: esSum
            ? 'SUM reservado'
            : `${this.instalacionSeleccionada.nombre} reservada`,
          ubicacion: this.loteResidenteActual,
          detalle: esSum
            ? `Fecha: ${fechaFormateada}`
            : `Fecha: ${fechaFormateada} (${this.horarioSeleccionado})`
        });
        this.cdr.markForCheck();
        void this.router.navigate(['/resident-home']);
      },
      error: (err) => {
        console.error('No se pudo registrar la reserva en el backend:', err);
        this.procesandoReserva = false;
        this.mensajeErrorReserva = 'No se pudo confirmar la reserva. Revisá la conexión e intentá nuevamente.';
        this.cdr.markForCheck();
      }
    });
  }

  volver(): void {
    void this.router.navigate(['/resident-home']);
  }

  trackByInstalacionId(_index: number, item: InstalacionBarrio): string {
    return item.id;
  }

  trackByHorario(_index: number, horario: string): string {
    return horario;
  }

  trackByFecha(_index: number, item: DiaCalendarioReserva): string {
    return item.fecha;
  }

  @HostListener('document:click', ['$event'])
  cerrarDropdownAlClickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('.instalacion-dropdown-container')) {
      this.listaInstalacionesAbierta = false;
    }
  }

  @HostListener('document:keydown.escape')
  cerrarDropdownConEscape(): void {
    this.listaInstalacionesAbierta = false;
  }

  private formatearFechaISO(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}