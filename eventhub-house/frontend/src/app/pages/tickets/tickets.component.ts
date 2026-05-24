import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { BookingService } from '../../core/services/booking.service';
import { Ticket } from '../../models/event.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <section class="tickets-page page">
      <div class="container">
        <header class="page-heading">
          <span class="eyebrow">YOUR PASSES</span>
          <h1>I miei <span class="gradient-text">biglietti</span></h1>
          <p>Mostra il QR code all'ingresso dell'evento.</p>
        </header>

        <p *ngIf="loading()" class="loading">
          Caricamento biglietti...
        </p>

        <p *ngIf="error()" class="error-message">
          {{ error() }}
        </p>

        <p *ngIf="success()" class="success-message">
          {{ success() }}
        </p>

        <div class="tickets-grid" *ngIf="!loading() && tickets().length > 0">
          <article class="ticket card" *ngFor="let ticket of tickets()">
            <div class="ticket-header">
              <span class="badge">DIGITAL TICKET</span>

              <h2>{{ ticket.event.title }}</h2>

              <p class="event-place">
                {{ ticket.event.location }} · {{ ticket.event.city }}
              </p>
            </div>

            <div class="ticket-body">
              <div class="qr-box">
                <img
                  *ngIf="qrImages()[ticket.id]"
                  [src]="qrImages()[ticket.id]"
                  [alt]="'QR code ' + ticket.event.title">
              </div>

              <div class="ticket-info">
                <span>DATA EVENTO</span>
                <strong>{{ formatDate(ticket.event.date) }}</strong>

                <span>PREZZO</span>
                <strong>{{ formatPrice(ticket.event.price) }}</strong>

                <span>CODICE BIGLIETTO</span>
                <code>{{ ticket.qr_code }}</code>
              </div>
            </div>

            <div class="ticket-actions">
              <a
                class="btn btn-outline"
                [routerLink]="['/eventi', ticket.event.id]">
                Dettaglio evento
              </a>

              <button
                type="button"
                class="cancel-button"
                (click)="cancelBooking(ticket.event.id)">
                Annulla iscrizione
              </button>
            </div>
          </article>
        </div>

        <div
          class="empty-state card"
          *ngIf="!loading() && tickets().length === 0 && !error()">
          <h2>Nessun biglietto</h2>
          <p>Non sei ancora iscritto a nessun evento.</p>
          <a routerLink="/" class="btn btn-primary">
            Scopri gli eventi
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-heading {
      margin-bottom: 42px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 16px;
      color: #c26eff;
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2.8rem, 6vw, 4rem);
    }

    .page-heading p {
      margin: 0;
      color: #a4a3b3;
      font-size: 1.05rem;
    }

    .loading {
      color: #a4a3b3;
      font-size: 1.05rem;
    }

    .tickets-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 25px;
    }

    .ticket {
      overflow: hidden;
    }

    .ticket-header {
      padding: 28px;
      border-bottom: 1px dashed rgba(255,255,255,.16);
      background:
        radial-gradient(circle at 92% 0, rgba(252,56,172,.19), transparent 38%),
        rgba(255,255,255,.012);
    }

    .ticket-header h2 {
      margin: 19px 0 10px;
      font-size: 1.55rem;
    }

    .event-place {
      margin: 0;
      color: #a4a3b3;
    }

    .ticket-body {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr);
      gap: 24px;
      align-items: center;
      padding: 28px;
    }

    .qr-box {
      min-height: 170px;
      padding: 10px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: white;
    }

    .qr-box img {
      width: 100%;
      display: block;
    }

    .ticket-info {
      min-width: 0;
      display: grid;
      gap: 8px;
    }

    .ticket-info span {
      margin-top: 11px;
      color: #8e8d9d;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .ticket-info strong {
      color: white;
      line-height: 1.4;
    }

    code {
      color: #c977ff;
      overflow-wrap: anywhere;
      font-size: .86rem;
    }

    .ticket-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 0 28px 28px;
    }

    .ticket-actions .btn {
      min-height: 44px;
      padding: 0 19px;
      font-size: .9rem;
    }

    .cancel-button {
      border: 0;
      color: #fc78a8;
      background: transparent;
      font-weight: 600;
    }

    .cancel-button:hover {
      color: white;
    }

    .empty-state {
      padding: 75px 20px;
    }

    .empty-state h2 {
      margin: 0 0 16px;
      color: white;
    }

    .empty-state p {
      margin: 0 0 30px;
    }

    @media (max-width: 950px) {
      .tickets-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 560px) {
      .ticket-body {
        grid-template-columns: 1fr;
      }

      .qr-box {
        width: 175px;
        margin: 0 auto;
      }

      .ticket-actions {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
    }
  `]
})
export class TicketsComponent implements OnInit {
  tickets = signal<Ticket[]>([]);
  qrImages = signal<Record<number, string>>({});
  loading = signal(true);
  error = signal('');
  success = signal('');

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set('');

    this.bookingService.getMyTickets().subscribe({
      next: async (tickets) => {
        this.tickets.set(tickets);
        await this.generateQrCodes(tickets);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(
          error.error?.message || 'Non è stato possibile caricare i tuoi biglietti.'
        );
      }
    });
  }

  async generateQrCodes(tickets: Ticket[]): Promise<void> {
    const generatedImages: Record<number, string> = {};

    for (const ticket of tickets) {
      generatedImages[ticket.id] = await QRCode.toDataURL(ticket.qr_code, {
        width: 180,
        margin: 1
      });
    }

    this.qrImages.set(generatedImages);
  }

  cancelBooking(eventId: number): void {
    const confirmed = window.confirm(
      'Vuoi davvero annullare l iscrizione a questo evento?'
    );

    if (!confirmed) {
      return;
    }

    this.error.set('');
    this.success.set('');

    this.bookingService.cancelBooking(eventId).subscribe({
      next: () => {
        this.success.set('Iscrizione annullata correttamente.');
        this.loadTickets();
      },
      error: (error) => {
        this.error.set(
          error.error?.message || 'Non è stato possibile annullare l iscrizione.'
        );
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(new Date(date));
  }
}
