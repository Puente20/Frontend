import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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

    // Simulacion de egreso
    console.log('Egreso simulado:', dnisLimpios);

    this.mensajeExito =
      'Se validaron correctamente los ' +
      dnisLimpios.length +
      ' DNI. Egreso de prueba, todavía no registrado.';

  }

  volver(): void {
    this.router.navigate(['/guardia-home']);
  }

}