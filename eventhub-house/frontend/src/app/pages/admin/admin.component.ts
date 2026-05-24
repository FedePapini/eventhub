import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AdminReview, AdminService } from '../../core/services/admin.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <section class="admin-page page">
      <div class="container">
        <header class="page-header">
          <span class="eyebrow">ADMIN CONTROL PANEL</span>
          <h1>Gestione <span class="gradient-text">piattaforma</span></h1>
          <p>Gestisci utenti, ruoli, ban e recensioni segnalate.</p>
        </header>

        <p *ngIf="loading()" class="loading">Caricamento area admin...</p>

        <p *ngIf="error()" class="error-message">
          {{ error() }}
        </p>

        <p *ngIf="success()" class="success-message">
          {{ success() }}
        </p>

        <ng-container *ngIf="!loading()">
          <div class="stats-grid">
            <article class="card stat-card">
              <span>UTENTI TOTALI</span>
              <strong>{{ users().length }}</strong>
              <small>Account registrati</small>
            </article>

            <article class="card stat-card">
              <span>ORGANIZER</span>
              <strong>{{ organizerCount() }}</strong>
              <small>Gestori eventi</small>
            </article>

            <article class="card stat-card">
              <span>UTENTI BANNATI</span>
              <strong>{{ bannedCount() }}</strong>
              <small>Account sospesi</small>
            </article>

            <article class="card stat-card reports">
              <span>SEGNALAZIONI</span>
              <strong>{{ reportedReviews().length }}</strong>
              <small>Recensioni da moderare</small>
            </article>
          </div>

          <section class="card panel">
            <div class="panel-heading">
              <div>
                <h2>Gestione utenti</h2>
                <p>Promuovi gli utenti a organizer o sospendi il loro accesso.</p>
              </div>
            </div>

            <div class="table-wrapper" *ngIf="users().length > 0; else noUsers">
              <table>
                <thead>
                  <tr>
                    <th>UTENTE</th>
                    <th>RUOLO</th>
                    <th>STATO</th>
                    <th>DATA REGISTRAZIONE</th>
                    <th>AZIONI</th>
                  </tr>
                </thead>

                <tbody>
                  <tr *ngFor="let user of users()">
                    <td>
                      <strong class="user-name">{{ user.name }}</strong>
                      <small>{{ user.email }}</small>
                    </td>

                    <td>
                      <span
                        class="role"
                        [class.role-admin]="user.role === 'admin'"
                        [class.role-organizer]="user.role === 'organizer'">
                        {{ roleLabel(user.role) }}
                      </span>
                    </td>

                    <td>
                      <span class="status" [class.status-banned]="user.is_banned">
                        {{ user.is_banned ? 'Bannato' : 'Attivo' }}
                      </span>
                    </td>

                    <td>
                      {{ user.created_at ? formatDate(user.created_at) : '-' }}
                    </td>

                    <td class="actions">
                      <ng-container *ngIf="user.role !== 'admin'; else adminProtected">
                        <button
                          *ngIf="user.role === 'user'"
                          type="button"
                          class="pill promote"
                          (click)="changeRole(user, 'organizer')">
                          Promuovi
                        </button>

                        <button
                          *ngIf="user.role === 'organizer'"
                          type="button"
                          class="pill demote"
                          (click)="changeRole(user, 'user')">
                          Rendi utente
                        </button>

                        <button
                          type="button"
                          class="pill ban"
                          [class.unban]="user.is_banned"
                          (click)="toggleBan(user)">
                          {{ user.is_banned ? 'Rimuovi ban' : 'Banna' }}
                        </button>
                      </ng-container>

                      <ng-template #adminProtected>
                        <span class="protected">Account protetto</span>
                      </ng-template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noUsers>
              <div class="empty-state">Nessun utente trovato.</div>
            </ng-template>
          </section>

          <section class="card panel">
            <div class="panel-heading moderation-heading">
              <div>
                <h2>Moderazione recensioni</h2>
                <p>Controlla le recensioni segnalate dagli utenti.</p>
              </div>

              <span class="counter">
                {{ reportedReviews().length }} segnalate
              </span>
            </div>

            <div class="reviews-grid" *ngIf="reportedReviews().length > 0; else noReviews">
              <article class="review-card" *ngFor="let review of reportedReviews()">
                <div class="review-header">
                  <div>
                    <strong>{{ review.user.name }}</strong>
                    <p>{{ review.event.title }}</p>
                  </div>

                  <span class="stars">{{ stars(review.rating) }}</span>
                </div>

                <p class="comment">“{{ review.comment }}”</p>

                <small>{{ formatDate(review.created_at) }}</small>

                <div class="review-actions">
                  <button
                    type="button"
                    class="btn approve"
                    (click)="approveReview(review)">
                    Approva
                  </button>

                  <button
                    type="button"
                    class="btn remove"
                    (click)="deleteReview(review)">
                    Elimina
                  </button>
                </div>
              </article>
            </div>

            <ng-template #noReviews>
              <div class="empty-state">
                <h3>Nessuna recensione da moderare</h3>
                <p>Al momento non ci sono recensioni segnalate.</p>
              </div>
            </ng-template>
          </section>
        </ng-container>
      </div>
    </section>
  `,
  styles: [`
    .page-header {
      margin-bottom: 42px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 16px;
      color: #c26eff;
      font-size: .74rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .page-header h1 {
      margin: 0 0 13px;
      font-size: clamp(2.7rem, 6vw, 4rem);
    }

    .page-header p {
      margin: 0;
      color: #a3a2b2;
      font-size: 1.04rem;
    }

    .loading {
      color: #a3a2b2;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 25px;
    }

    .stat-card {
      padding: 27px;
    }

    .stat-card span {
      display: block;
      margin-bottom: 16px;
      color: #9190a1;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .stat-card strong {
      display: block;
      margin-bottom: 9px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.3rem;
    }

    .stat-card small {
      color: #9190a1;
    }

    .reports strong {
      color: #fc78a8;
    }

    .panel {
      overflow: hidden;
      margin-bottom: 26px;
    }

    .panel-heading {
      padding: 28px 29px 24px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .panel-heading h2 {
      margin: 0 0 9px;
      font-size: 1.55rem;
    }

    .panel-heading p {
      margin: 0;
      color: #9291a3;
    }

    .moderation-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 22px;
    }

    .counter {
      padding: 9px 15px;
      border-radius: 999px;
      color: #ff98ba;
      background: rgba(211,41,94,.16);
      font-size: .8rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 960px;
      border-collapse: collapse;
    }

    th {
      padding: 18px 20px;
      color: #898899;
      text-align: left;
      font-size: .67rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    td {
      padding: 20px;
      color: #d0cfda;
      border-top: 1px solid rgba(255,255,255,.06);
    }

    .user-name {
      display: block;
      margin-bottom: 7px;
      color: white;
    }

    td small {
      color: #9291a3;
    }

    .role,
    .status {
      display: inline-flex;
      padding: 7px 12px;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .role {
      color: #e3e1eb;
      background: rgba(255,255,255,.08);
    }

    .role-organizer {
      color: #ddaeff;
      background: rgba(147,44,255,.17);
    }

    .role-admin {
      color: #ffacd1;
      background: rgba(252,56,172,.16);
    }

    .status {
      color: #78f0c8;
      background: rgba(24,174,126,.14);
    }

    .status-banned {
      color: #ff98b5;
      background: rgba(211,41,94,.17);
    }

    .actions {
      white-space: nowrap;
    }

    .pill {
      padding: 9px 12px;
      margin: 3px 7px 3px 0;
      border-radius: 999px;
      font-size: .79rem;
      font-weight: 600;
      border: 1px solid transparent;
    }

    .promote {
      color: #d5a2ff;
      border-color: rgba(147,44,255,.42);
      background: rgba(147,44,255,.13);
    }

    .demote {
      color: #91eff5;
      border-color: rgba(39,226,233,.36);
      background: rgba(39,226,233,.1);
    }

    .ban {
      color: #ff91b0;
      border-color: rgba(211,41,94,.42);
      background: rgba(211,41,94,.13);
    }

    .unban {
      color: #79f1c9;
      border-color: rgba(24,174,126,.4);
      background: rgba(24,174,126,.13);
    }

    .protected {
      color: #8f8e9f;
      font-size: .84rem;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      padding: 27px;
    }

    .review-card {
      padding: 24px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.018);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

    .review-header p {
      margin: 8px 0 0;
      color: #9291a3;
    }

    .stars {
      color: #ffd45a;
      white-space: nowrap;
      letter-spacing: 2px;
    }

    .comment {
      min-height: 55px;
      margin: 0 0 16px;
      color: #dddce6;
      line-height: 1.7;
    }

    .review-card small {
      color: #898899;
    }

    .review-actions {
      display: flex;
      gap: 10px;
      margin-top: 22px;
    }

    .review-actions .btn {
      min-height: 43px;
      padding: 0 17px;
      font-size: .84rem;
    }

    .approve {
      color: #75efc6;
      border: 1px solid rgba(24,174,126,.38);
      background: rgba(24,174,126,.13);
    }

    .remove {
      color: #ff92af;
      border: 1px solid rgba(211,41,94,.4);
      background: rgba(211,41,94,.13);
    }

    .empty-state {
      padding: 58px 20px;
      text-align: center;
      color: #9b9aaa;
    }

    .empty-state h3 {
      margin: 0 0 12px;
      color: white;
    }

    .empty-state p {
      margin: 0;
    }

    @media (max-width: 1050px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .reviews-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 580px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .moderation-heading {
        display: block;
      }

      .counter {
        display: inline-flex;
        margin-top: 19px;
      }

      .review-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  users = signal<User[]>([]);
  reportedReviews = signal<AdminReview[]>([]);
  loading = signal(true);
  error = signal('');
  success = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);

        this.adminService.getReportedReviews().subscribe({
          next: (reviews) => {
            this.reportedReviews.set(reviews);
            this.loading.set(false);
          },
          error: (response) => {
            this.loading.set(false);
            this.error.set(
              response.error?.message || 'Errore nel caricamento delle recensioni.'
            );
          }
        });
      },
      error: (response) => {
        this.loading.set(false);
        this.error.set(
          response.error?.message || 'Errore nel caricamento degli utenti.'
        );
      }
    });
  }

  toggleBan(user: User): void {
    const action = user.is_banned ? 'rimuovere il ban da' : 'bannare';

    if (!window.confirm(`Vuoi davvero ${action} ${user.name}?`)) {
      return;
    }

    this.clearMessages();

    this.adminService.toggleBan(user.id).subscribe({
      next: (response) => {
        this.success.set(response.message);
        this.updateUser(response.user);
      },
      error: (response) => {
        this.error.set(response.error?.message || 'Operazione non riuscita.');
      }
    });
  }

  changeRole(user: User, newRole: UserRole): void {
    const question = newRole === 'organizer'
      ? `Vuoi promuovere ${user.name} a organizer?`
      : `Vuoi riportare ${user.name} al ruolo utente?`;

    if (!window.confirm(question)) {
      return;
    }

    this.clearMessages();

    this.adminService.updateRole(user.id, newRole).subscribe({
      next: (response) => {
        this.success.set(response.message);
        this.updateUser(response.user);
      },
      error: (response) => {
        this.error.set(response.error?.message || 'Modifica del ruolo non riuscita.');
      }
    });
  }

  approveReview(review: AdminReview): void {
    this.clearMessages();

    this.adminService.approveReview(review.id).subscribe({
      next: () => {
        this.success.set('Recensione approvata.');
        this.reportedReviews.update(
          (reviews) => reviews.filter((item) => item.id !== review.id)
        );
      },
      error: () => {
        this.error.set('Non è stato possibile approvare la recensione.');
      }
    });
  }

  deleteReview(review: AdminReview): void {
    if (!window.confirm('Vuoi eliminare definitivamente questa recensione?')) {
      return;
    }

    this.clearMessages();

    this.adminService.deleteReview(review.id).subscribe({
      next: () => {
        this.success.set('Recensione eliminata.');
        this.reportedReviews.update(
          (reviews) => reviews.filter((item) => item.id !== review.id)
        );
      },
      error: () => {
        this.error.set('Non è stato possibile eliminare la recensione.');
      }
    });
  }

  updateUser(updatedUser: User): void {
    this.users.update(
      (users) => users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  }

  clearMessages(): void {
    this.error.set('');
    this.success.set('');
  }

  organizerCount(): number {
    return this.users().filter((user) => user.role === 'organizer').length;
  }

  bannedCount(): number {
    return this.users().filter((user) => user.is_banned).length;
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      user: 'UTENTE',
      organizer: 'ORGANIZER',
      admin: 'ADMIN'
    };

    return labels[role] || role.toUpperCase();
  }

  stars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }
}
