import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nueva-reserva',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nueva-reserva.component.html',
  styleUrl: './nueva-reserva.component.css',
})
export class NuevaReservaComponent {}