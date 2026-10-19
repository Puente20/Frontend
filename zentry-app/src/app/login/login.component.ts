import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Controla el deslizador: 'residente' o 'admin'
  rolSeleccionado: 'residente' | 'admin' = 'residente';

  // Controla la visibilidad de la contraseña
  mostrarPassword: boolean = false;

  // Función para cambiar el deslizador
  cambiarRol(rol: 'residente' | 'admin') {
    this.rolSeleccionado = rol;
  }

  // Función para alternar el ícono del ojo
  ojoContra() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}