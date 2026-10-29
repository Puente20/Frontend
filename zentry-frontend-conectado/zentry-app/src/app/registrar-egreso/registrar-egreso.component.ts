import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InvitacionService } from '../invitaciones-activas/invitacion.service';
import { GuardiaHistorialService } from '../services/guardia-historial.service';

@Component({
  selector: 'app-registrar-egreso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-egreso.component.html',
  styleUrl: './registrar-egreso.component.css'
})
export class RegistrarEgresoComponent implements OnInit {

  // Lista de DNI de las personas que egresan
  dnis: string[] = [''];

  mensajeError: string = '';
  mensajeExito: string = '';
  guardando = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private invitacionService: InvitacionService,
    private guardiaHistorial: GuardiaHistorialService
  ) {}

  ngOnInit(): void {
    const dni = this.route.snapshot.queryParamMap.get('dni');
    if (dni) {
      this.dnis[0] = dni;
    }
  }

  obtenerNombre(dni: string): string {
    return this.guardiaHistorial.obtenerNombrePorDni(dni);
  }

  // Agregar una nueva persona
  agregarPersona(): void {
    this.dnis.push('');
    this.limpiarMensajes();
  }

  // Eliminar una persona
  quitarPersona(index: number): void {
    if (index > 0) {
      this.dnis.splice(index, 1);
      this.limpiarMensajes();
    }
  }

  // Identificar cada campo
  trackByIndex(index: number): number {
    return index;
  }

  // Limpiar mensajes
  limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  // Validar los DNI ingresados
  aceptarEgreso(): void {
    if (this.guardando) {
      return;
    }

    this.limpiarMensajes();

    const dnisLimpios = this.dnis.map(dni => dni.trim());

    // Validar que todos los DNI tengan 7 u 8 numeros
    for (let i = 0; i < dnisLimpios.length; i++) {

      if (!/^\d{7,8}$/.test(dnisLimpios[i])) {

        this.mensajeError =
          'El DNI de la persona ' + (i + 1) +
          ' debe contener 7 u 8 números.';

        return;
      }
    }

    // Validar que no existan DNI repetidos
    const dnisUnicos = new Set(dnisLimpios);

    if (dnisUnicos.size !== dnisLimpios.length) {
      this.mensajeError = 'No se puede ingresar el mismo DNI dos veces.';
      return;
    }

    this.guardando = true;
    this.invitacionService.registrarEgresoEnBackend(dnisLimpios).subscribe({
      next: (res) => {
        this.guardiaHistorial.registrarEgresos(dnisLimpios);
        this.mensajeExito = res.mensaje || `Se registraron correctamente los ${dnisLimpios.length} egresos en la base de datos.`;
        this.guardando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError = this.obtenerMensajeError(error);
        this.guardando = false;
      }
    });

  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    const cuerpo: unknown = error.error;
    if (typeof cuerpo === 'object' && cuerpo !== null) {
      const mensajes = Object.values(cuerpo).flatMap((valor) =>
        Array.isArray(valor) ? valor : [valor]
      ).filter((valor): valor is string => typeof valor === 'string');
      if (mensajes.length) {
        return mensajes.join(' ');
      }
    }

    return 'No se pudo registrar el egreso. Revisá el DNI y la conexión con el servidor.';
  }

  volver(): void {
    this.router.navigate(['/guardia-home']);
  }

}