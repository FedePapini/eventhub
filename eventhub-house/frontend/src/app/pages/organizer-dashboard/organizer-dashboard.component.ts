import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Attendee,
  OrganizerDashboard,
  OrganizerDashboardEvent,
  OrganizerService
} from '../../core/services/organizer.service';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <section class="dashboard-page page">
      <div class="container">
        <header class="page-header">
          <div>
            <span class="eyebrow">ORGANIZER AREA</span>
            <h1>Dashboard <span class="gradient-text">eventi</span></h1>
            <p>Controlla prenotazioni, incassi e gestione delle tue serate.</p>
          </div>

          <a routerLink="/organizer/nuovo-evento" class="btn btn-primary">
            + Crea evento
          </a>
        </header>

        <p *ngIf="loading()" class="loading">
          Caricamento dashboard...
        </p>

        <p *ngIf="error()" class="error-message">
          {{ error() }}
        </p>

        <p *ngIf="success()" class="success-message">
          {{ success() }}
        </p>

        <ng-container *ngIf="dashboard() as data">
          <div class="stats-grid">
            <article class="card stat-card">
              <span>EVENTI PUBBLICATI</span>
              <strong>{{ data.summary.total_events }}</strong>
              <small>Eventi gestiti da te</small>
            </article>

            <article class="card stat-card">
              <span>ISCRITTI TOTALI</span>
              <strong>{{ data.summary.total_enrolled }}</strong>
              <small>Biglietti emessi</small>
            </article>

            <article class="card stat-card">
              <span>INCASSO STIMATO</span>
              <strong>{{ formatPrice(data.summary.total_estimated_revenue) }}</strong>
              <small>Totale prenotazioni</small>
            </article>
          </div>

          <section class="card events-panel">
            <div class="panel-title">
              <div>
                <h2>I tuoi eventi</h2>
                <p>Modifica, elimina o esporta i dati dei partecipanti.</p>
              </div>
            </div>

            <div class="table-wrapper" *ngIf="data.events.length > 0; else noEvents">
              <table>
                <thead>
                  <tr>
                    <th>EVENTO</th>
                    <th>DATA</th>
                    <th>ISCRITTI</th>
                    <th>INCASSO</th>
                    <th>RATING</th>
                    <th>GESTIONE</th>
                  </tr>
                </thead>

                <tbody>
                  <tr *ngFor="let event of data.events">
                    <td>
                      <strong class="event-name">{{ event.title }}</strong>
                      <small>{{ event.city }}</small>
                    </td>

                    <td>{{ formatDate(event.date) }}</td>

                    <td>{{ event.enrolled }} / {{ event.capacity }}</td>

                    <td>{{ formatPrice(event.estimated_revenue) }}</td>

                    <td>
                      {{
                        event.average_rating === null
                          ? 'Nessun voto'
                          : '★ ' + event.average_rating + ' / 5'
                      }}
                    </td>

                    <td class="actions">
                      <a
                        class="action-button edit"
                        [routerLink]="['/organizer/modifica-evento', event.id]">
                        Modifica
                      </a>

                      <button
                        type="button"
                        class="action-button"
                        (click)="openAttendees(event)">
                        Iscritti
                      </button>

                      <button
                        type="button"
                        class="action-button csv"
                        (click)="downloadCsv(event)">
                        CSV
                      </button>

                      <button
                        type="button"
                        class="action-button delete"
                        (click)="deleteEvent(event)">
                        Elimina
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noEvents>
              <div class="empty-state">
                <h3>Non hai ancora eventi</h3>
                <p>Crea il tuo primo evento house.</p>
                <a routerLink="/organizer/nuovo-evento" class="btn btn-primary">
                  Crea evento
                </a>
              </div>
            </ng-template>
          </section>

          <section class="card attendees-panel" *ngIf="selectedEvent() as event">
            <div class="attendees-header">
              <div>
                <span class="eyebrow small">PARTECIPANTI</span>
                <h2>{{ event.title }}</h2>
              </div>

              <button
                type="button"
                class="close-button"
                (click)="closeAttendees()">
                ✕
              </button>
            </div>

            <p *ngIf="attendeesLoading()" class="loading">
              Caricamento iscritti...
            </p>

            <div
              class="attendees-list"
              *ngIf="!attendeesLoading() && attendees().length > 0">
              <article class="attendee" *ngFor="let attendee of attendees()">
                <div class="attendee-identity">
                  <div class="avatar">
                    {{ attendee.name.charAt(0).toUpperCase() }}
                  </div>

                  <div>
                    <strong>{{ attendee.name }}</strong>
                    <p>{{ attendee.email }}</p>
                  </div>
                </div>

                <div class="ticket-code">
                  <span>CODICE BIGLIETTO</span>
                  <code>{{ attendee.ticket_code }}</code>
                </div>
              </article>
            </div>

            <div
              class="empty-attendees"
              *ngIf="!attendeesLoading() && attendees().length === 0">
              Nessun utente iscritto a questo evento.
            </div>
          </section>
        </ng-container>
      </div>
    </section>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 26px;
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

    .eyebrow.small {
      font-size: .68rem;
      margin-bottom: 11px;
    }

    .page-header h1 {
      margin: 0 0 13px;
      font-size: clamp(2.8rem, 6vw, 4rem);
    }

    .page-header p {
      margin: 0;
      color: #a3a2b2;
      font-size: 1.04rem;
    }

    .page-header .btn {
      border: 0;
      white-space: nowrap;
    }

    .loading {
      color: #a3a2b2;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 19px;
      margin-bottom: 25px;
    }

    .stat-card {
      padding: 28px;
    }

    .stat-card span {
      display: block;
      margin-bottom: 16px;
      color: #9190a1;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .stat-card strong {
      display: block;
      margin-bottom: 10px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2rem, 4vw, 2.45rem);
    }

    .stat-card small {
      color: #8c8b9d;
    }

    .events-panel {
      overflow: hidden;
      margin-bottom: 26px;
    }

    .panel-title {
      padding: 28px 29px 23px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .panel-title h2,
    .attendees-header h2 {
      margin: 0 0 9px;
      font-size: 1.55rem;
    }

    .panel-title p {
      margin: 0;
      color: #9190a1;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 1030px;
      border-collapse: collapse;
    }

    th {
      padding: 18px 18px;
      color: #898899;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-align: left;
    }

    td {
      padding: 20px 18px;
      color: #d0cfda;
      border-top: 1px solid rgba(255,255,255,.06);
    }

    .event-name {
      display: block;
      margin-bottom: 7px;
      color: white;
    }

    td small {
      color: #9190a1;
    }

    .actions {
      white-space: nowrap;
    }

    .action-button {
      display: inline-flex;
      margin: 3px 5px 3px 0;
      padding: 8px 11px;
      border: 1px solid rgba(147,44,255,.4);
      border-radius: 999px;
      color: #d5a2ff;
      background: rgba(147,44,255,.12);
      font-size: .82rem;
      font-weight: 600;
    }

    .action-button.edit {
      color: #8ff4ff;
      border-color: rgba(39,226,233,.38);
      background: rgba(39,226,233,.1);
    }

    .action-button.csv {
      color: #ff98c9;
      border-color: rgba(252,56,172,.36);
      background: rgba(252,56,172,.1);
    }

    .action-button.delete {
      color: #ff8fae;
      border-color: rgba(211,41,94,.4);
      background: rgba(211,41,94,.13);
    }

    .action-button:hover {
      transform: translateY(-1px);
    }

    .empty-state {
      padding: 65px 20px;
    }

    .empty-state h3 {
      margin: 0 0 11px;
      color: white;
    }

    .empty-state p {
      margin: 0 0 27px;
    }

    .attendees-panel {
      padding: 29px;
    }

    .attendees-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 20px;
      margin-bottom: 21px;
    }

    .close-button {
      width: 40px;
      height: 40px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 50%;
      color: #afafbd;
      background: transparent;
    }

    .attendee {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 28px;
      padding: 19px 0;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .attendee-identity {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .avatar {
      width: 46px;
      height: 46px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: white;
      font-weight: 700;
      background: linear-gradient(125deg, #932cff, #fc38ac);
    }

    .attendee-identity p {
      margin: 7px 0 0;
      color: #9998a8;
    }

    .ticket-code {
      display: grid;
      gap: 8px;
      text-align: right;
    }

    .ticket-code span {
      color: #898899;
      font-size: .65rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .ticket-code code {
      color: #cf84ff;
      overflow-wrap: anywhere;
    }

    .empty-attendees {
      padding: 28px 0;
      color: #9897a7;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    @media (max-width: 850px) {
      .page-header {
        display: block;
      }

      .page-header .btn {
        margin-top: 27px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .attendee {
        display: block;
      }

      .ticket-code {
        margin-top: 17px;
        text-align: left;
      }
    }
  `]
})
export class OrganizerDashboardComponent implements OnInit {
  dashboard = signal<OrganizerDashboard | null>(null);
  selectedEvent = signal<OrganizerDashboardEvent | null>(null);
  attendees = signal<Attendee[]>([]);
  loading = signal(true);
  attendeesLoading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private organizerService: OrganizerService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    this.organizerService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: (response) => {
        this.loading.set(false);
        this.error.set(
          response.error?.message ||
          'Non è stato possibile caricare la dashboard organizer.'
        );
      }
    });
  }

  openAttendees(event: OrganizerDashboardEvent): void {
    this.selectedEvent.set(event);
    this.attendees.set([]);
    this.attendeesLoading.set(true);

    this.organizerService.getAttendees(event.id).subscribe({
      next: (response) => {
        this.attendees.set(response.attendees);
        this.attendeesLoading.set(false);
      },
      error: (response) => {
        this.attendeesLoading.set(false);
        this.error.set(
          response.error?.message ||
          'Non è stato possibile caricare gli iscritti.'
        );
      }
    });
  }

  closeAttendees(): void {
    this.selectedEvent.set(null);
    this.attendees.set([]);
  }

  downloadCsv(event: OrganizerDashboardEvent): void {
    this.organizerService.exportAttendeesCsv(event.id).subscribe({
      next: (file) => {
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');

        link.href = url;
        link.download = `iscritti_evento_${event.id}.csv`;
        link.click();

        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Non è stato possibile esportare il file CSV.');
      }
    });
  }

  deleteEvent(event: OrganizerDashboardEvent): void {
    const confirmed = window.confirm(
      `Vuoi davvero eliminare l evento "${event.title}"? Le prenotazioni collegate verranno eliminate.`
    );

    if (!confirmed) {
      return;
    }

    this.error.set('');
    this.success.set('');

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.closeAttendees();
        this.success.set('Evento eliminato correttamente.');
        this.loadDashboard();
      },
      error: (response) => {
        this.error.set(
          response.error?.message ||
          'Non è stato possibile eliminare l evento.'
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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }
}
