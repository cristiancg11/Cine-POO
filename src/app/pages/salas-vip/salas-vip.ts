import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaService } from '../../services/sala.service';
import { Sala } from '../../models/sala.model';

@Component({
  selector: 'app-salas-vip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salas-vip.html',
  styleUrl: './salas-vip.css'
})
export class SalasVip implements OnInit {
  salaService = inject(SalaService);
  
  salasVip: Sala[] = [];
  isLoading = true;

  ngOnInit() {
    this.salaService.getAll().subscribe({
      next: (data) => {
        // En backend el campo es 'tipoSala' en lugar de 'tipo'?
        // En sala.model.ts es 'tipo', pero revisaremos el JSON.
        // Asumiendo que el campo para distinguir VIP es 'tipo' o nombre contiene VIP
        this.salasVip = data.filter(s => s.tipoSala === 'VIP' || s.nombre.includes('VIP'));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching salas', err);
        this.isLoading = false;
      }
    });
  }
}
