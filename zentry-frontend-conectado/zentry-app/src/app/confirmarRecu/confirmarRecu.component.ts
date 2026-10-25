import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmar-recu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmarRecu.component.html',
  styleUrl: './confirmarRecu.component.css'
})

export class ConfRecuComponent {

    constructor(private router: Router) {}

    volveraAtras() {
        this.router.navigate(['/login']);
    }
}