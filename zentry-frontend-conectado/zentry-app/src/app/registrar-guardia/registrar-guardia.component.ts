import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-guardia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-guardia.component.html',
  styleUrl: './registrar-guardia.component.css'
})
export class RegistrarGuardiaComponent {
  adminNombre = 'Valentina Canepa';
  adminRol = 'Administradora';

  guardia = {
    nombre: '',
    mail: '',
    contra: ''
  };

  mensajeFormulario = '';
  tipoMensaje: 'error' | 'info' | '' = '';

  constructor(private router: Router) {}

  cancelar(): void {
    void this.router.navigate(['/admin-home']);
  }

  darAlta(): void {
    const nombre = this.guardia.nombre.trim();
    const mail = this.guardia.mail.trim();
    const contra = this.guardia.contra;

    if (!nombre || !mail || !contra.trim()) {
      this.mostrarMensaje('Completá todos los campos para continuar.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      this.mostrarMensaje('Ingresá una dirección de correo válida.', 'error');
      return;
    }

    if (contra.length < 8) {
      this.mostrarMensaje('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    this.mostrarMensaje(
      'Los datos son válidos, pero el guardia todavía no se guarda: falta conectar el endpoint.',
      'info'
    );
  }

  private mostrarMensaje(mensaje: string, tipo: 'error' | 'info'): void {
    this.mensajeFormulario = mensaje;
    this.tipoMensaje = tipo;
  }
}
