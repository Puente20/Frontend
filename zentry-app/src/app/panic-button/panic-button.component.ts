import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'panic-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panic-button.component.html',
  styleUrl: './panic-button.component.css',
})
export class PanicButtonComponent {}