import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentesService } from '../services/residentes.service';
import { componerTelefono } from '../utils/residente-form.utils';

@Component({
  selector: 'app-alta-residentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alta-residentes.component.html',
  styleUrl: './alta-residentes.component.css'
})
export class AltaResidentesComponent {
  @ViewChild('lotesDropdownList') lotesDropdownList?: ElementRef<HTMLUListElement>;

  adminNombre: string = 'Valentina Canepa';
  adminRol: string = 'Administradora';
  fechaActual: string = '13 de Agosto de 2026';
  nombreBarrio: string = 'La Reserva Cardales';

  tipoResidente: 'propietario' | 'inquilino' = 'propietario';

  residente = {
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    codigoPais: '+54',
    codigoArea: '',
    numeroLocal: '',
    password: '',
    lote: ''
  };

  /** Lista base de lotes del 1 al 100 */
  readonly lotesBase: number[] = Array.from({ length: 100 }, (_, i) => i + 1);

  /** Texto ingresado o seleccionado en el campo de lote */
  loteFiltro: string = '';

  /** Controla la apertura del desplegable de lotes */
  listaLotesAbierta: boolean = false;

  /** Lista dinámica de patentes (permite 1, 2 o más vehículos) */
  patentes: string[] = [''];

  constructor(private router: Router, private residentesService: ResidentesService) {}

  seleccionarTipoResidente(tipo: 'propietario' | 'inquilino'): void {
    this.tipoResidente = tipo;
    if (tipo === 'inquilino') {
      void this.router.navigate(['/alta-inquilino']);
    }
  }

  /**
   * Devuelve los lotes del 1 al 100.
   * Si el usuario escribe un número, ese lote aparece primero arriba de todo en la lista,
   * seguido de los que comienzan con esos dígitos, los que los contienen y el resto en orden.
   */
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
    const num = Number(digitos);
    return num >= 1 && num <= 100 ? num : null;
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
      this.loteFiltro = this.residente.lote;
    }
    this.listaLotesAbierta = true;
    this.resetScrollLotes();
  }

  onLoteInputChange(valor: string): void {
    this.loteFiltro = valor;
    const digitos = valor.replace(/\D/g, '').trim();
    this.residente.lote = digitos;
    this.listaLotesAbierta = true;
    this.resetScrollLotes();
  }

  seleccionarLote(lote: number): void {
    this.residente.lote = String(lote);
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

  /**
   * Agrega un nuevo campo de patente debajo sin ocultar el botón '+'.
   * Permite cargar más de 2 autos.
   */
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

  @HostListener('document:click', ['$event'])
  cerrarDropdownAlClickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('.lote-select-container')) {
      this.listaLotesAbierta = false;
      if (this.residente.lote && !this.loteFiltro.startsWith('Lote ')) {
        const num = Number(this.residente.lote);
        if (num >= 1 && num <= 100) {
          this.loteFiltro = `Lote ${num}`;
        }
      }
    }
  }

  @HostListener('document:keydown.escape')
  cerrarDropdownConEscape(): void {
    this.listaLotesAbierta = false;
  }

  cancelar(): void {
    void this.router.navigate(['/admin-home']);
  }

  darAlta(): void {
    const nombre = this.residente.nombre.trim();
    const apellido = this.residente.apellido.trim();
    const dni = this.residente.dni.trim();
    const email = this.residente.email.trim();
    const codigoPais = this.residente.codigoPais.replace(/\D/g, '');
    const codigoArea = this.residente.codigoArea.replace(/\D/g, '');
    const numeroLocal = this.residente.numeroLocal.replace(/\D/g, '');
    const password = this.residente.password.trim();
    const telefono = componerTelefono(codigoPais, codigoArea, numeroLocal);
    const loteDigitos = (this.residente.lote || this.loteFiltro).replace(/\D/g, '').trim();

    if (!nombre || !apellido || !dni || !email || !codigoPais || !codigoArea || !numeroLocal ||
        !password || !loteDigitos) {
      alert('Por favor, completá todos los datos personales, la contraseña y la asignación de lote.');
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

    const numeroLote = Number(loteDigitos);
    if (isNaN(numeroLote) || numeroLote < 1 || numeroLote > 100) {
      alert('Por favor, seleccioná un lote válido del 1 al 100.');
      return;
    }

    const patentesCargadas = this.patentes
      .map((patente) => patente.trim().toUpperCase())
      .filter((patente) => patente.length > 0);

    this.residentesService.crearResidente({
      tipo: 'propietario',
      nombre,
      apellido,
      dni,
      email,
      telefono,
      password,
      lote_numero: numeroLote,
      patentes: patentesCargadas
    }).subscribe({
      next: (creado) => {
        console.log('Alta de propietario guardada en BD:', creado);
        void this.router.navigate(['/editar-residentes']);
      },
      error: (err) => {
        console.warn('No se pudo guardar el alta del propietario:', err);
        alert(err.error?.email?.[0] || err.error?.password?.[0] ||
          'No se pudo crear el residente. Revisá que el email no esté registrado e intentá nuevamente.');
      }
    });
  }
}