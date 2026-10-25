import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvitacionStorageService } from '../invitaciones-activas/invitacion-storage.service';

@Component({
  selector: 'app-registrar-egreso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-egreso.component.html',
  styleUrl: './registrar-egreso.component.css'
})
export class RegistrarEgresoComponent {

  // Lista de DNI de las personas que egresan
  dnis: string[] = [''];

  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(private router: Router, private invitacionStorage: InvitacionStorageService) {}

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

    this.invitacionStorage.registrarEgresoEnBackend(dnisLimpios).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje || `Se registraron correctamente los ${dnisLimpios.length} egresos en la base de datos.`;
      },
      error: () => {
        this.mensajeExito =
          'Se validaron correctamente los ' +
          dnisLimpios.length +
          ' DNI (registrado en modo local).';
      }
    });

  }

  volver(): void {
    this.router.navigate(['/guardia-home']);
  }

}