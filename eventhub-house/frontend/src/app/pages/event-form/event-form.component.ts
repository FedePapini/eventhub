import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  template: `
    <section class="event-form-page page">
      <div class="container">
        <a routerLink="/organizer" class="back-link">
          ← Torna alla dashboard
        </a>

        <header class="page-heading">
          <span class="eyebrow">
            {{ isEditMode() ? 'EDIT EVENT' : 'NEW EVENT' }}
          </span>

          <h1>
            {{ isEditMode() ? 'Modifica il tuo' : 'Crea un nuovo' }}
            <span class="gradient-text">evento</span>
          </h1>

          <p>
            {{
              isEditMode()
                ? 'Aggiorna informazioni, biglietti o locandina della serata.'
                : 'Pubblica una nuova serata house con locandina e informazioni complete.'
            }}
          </p>
        </header>

        <p *ngIf="loading()" class="loading">
          Caricamento evento...
        </p>

        <form
          *ngIf="!loading()"
          class="event-form card"
          [formGroup]="eventForm"
          (ngSubmit)="submitEvent()">

          <section class="form-section">
            <h2>Informazioni principali</h2>

            <div class="field">
              <label for="title">Titolo evento *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="Esempio: Purple House Experience">
            </div>

            <div class="field">
              <label for="description">Descrizione *</label>
              <textarea
                id="description"
                formControlName="description"
                placeholder="Descrivi la serata, gli artisti e l'esperienza..."></textarea>
            </div>

            <div class="fields-grid">
              <div class="field">
                <label for="category">Genere *</label>
                <select id="category" formControlName="category">
                  <option value="House">House</option>
                  <option value="Deep House">Deep House</option>
                  <option value="Tech House">Tech House</option>
                  <option value="Classic House">Classic House</option>
                  <option value="Progressive House">Progressive House</option>
                </select>
              </div>

              <div class="field">
                <label for="date">Data e ora *</label>
                <input id="date" type="datetime-local" formControlName="date">
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2>Location e biglietti</h2>

            <div class="fields-grid">
              <div class="field">
                <label for="city">Città *</label>
                <input id="city" type="text" formControlName="city" placeholder="Milano">
              </div>

              <div class="field">
                <label for="location">Location *</label>
                <input
                  id="location"
                  type="text"
                  formControlName="location"
                  placeholder="Club, venue o terrazza">
              </div>

              <div class="field">
                <label for="price">Prezzo biglietto (€) *</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  formControlName="price">
              </div>

              <div class="field">
                <label for="capacity">Numero posti *</label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  formControlName="capacity">
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2>Locandina evento</h2>

            <p class="section-note">
              {{
                isEditMode()
                  ? 'Carica una nuova immagine solo se vuoi sostituire la locandina attuale.'
                  : 'La locandina è facoltativa. Puoi caricare PNG, JPG, JPEG o WEBP.'
              }}
            </p>

            <label class="upload-box" for="image">
              <input
                id="image"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                (change)="onFileSelected($event)">

              <ng-container *ngIf="!imagePreview(); else previewTemplate">
                <div class="upload-placeholder">
                  <div class="upload-icon">↑</div>
                  <strong>Carica locandina</strong>
                  <span>Clicca qui per scegliere un'immagine</span>
                </div>
              </ng-container>

              <ng-template #previewTemplate>
                <img [src]="imagePreview()" alt="Anteprima locandina">
                <span class="change-image">Clicca per cambiare immagine</span>
              </ng-template>
            </label>

            <p class="selected-file" *ngIf="selectedFile() as file">
              Nuovo file selezionato: {{ file.name }}
            </p>
          </section>

          <p class="error-message" *ngIf="error()">
            {{ error() }}
          </p>

          <p class="success-message" *ngIf="success()">
            {{ success() }}
          </p>

          <div class="form-actions">
            <a routerLink="/organizer" class="btn btn-outline">
              Annulla
            </a>

            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="saving()">
              {{
                saving()
                  ? 'Salvataggio...'
                  : isEditMode()
                    ? 'Salva modifiche'
                    : 'Pubblica evento'
              }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: 34px;
      color: #fc38ac;
      font-weight: 600;
    }

    .page-heading {
      margin-bottom: 38px;
    }

    .eyebrow {
      display: block;
      margin-bottom: 16px;
      color: #c26eff;
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .page-heading h1 {
      margin: 0 0 13px;
      font-size: clamp(2.7rem, 6vw, 4rem);
    }

    .page-heading p {
      margin: 0;
      color: #a3a2b2;
      font-size: 1.04rem;
    }

    .loading {
      color: #a3a2b2;
    }

    .event-form {
      max-width: 850px;
      padding: 38px;
    }

    .form-section {
      margin-bottom: 40px;
    }

    .form-section:not(:first-child) {
      padding-top: 34px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .form-section h2 {
      margin: 0 0 27px;
      font-size: 1.55rem;
    }

    .section-note {
      margin: -16px 0 23px;
      color: #9291a3;
    }

    .fields-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0 18px;
    }

    .upload-box {
      min-height: 285px;
      position: relative;
      display: grid;
      place-items: center;
      overflow: hidden;
      text-align: center;
      cursor: pointer;
      border: 2px dashed rgba(147,44,255,.42);
      border-radius: 20px;
      color: #d8cde2;
      background: rgba(147,44,255,.045);
      transition: border-color .2s, background .2s;
    }

    .upload-box:hover {
      border-color: #fc38ac;
      background: rgba(252,56,172,.055);
    }

    .upload-box input {
      display: none;
    }

    .upload-placeholder {
      display: grid;
      gap: 10px;
      place-items: center;
    }

    .upload-icon {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 1.5rem;
      color: white;
      background: linear-gradient(125deg, #932cff, #fc38ac);
    }

    .upload-box strong {
      color: white;
      font-size: 1.15rem;
    }

    .upload-box span {
      color: #9897a7;
    }

    .upload-box img {
      width: 100%;
      height: 285px;
      display: block;
      object-fit: cover;
    }

    .change-image {
      position: absolute;
      bottom: 20px;
      padding: 11px 18px;
      border-radius: 999px;
      color: white !important;
      background: rgba(8,8,12,.8);
    }

    .selected-file {
      margin-top: 13px;
      color: #a3a2b2;
      font-size: .9rem;
    }

    .form-actions {
      display: flex;
      justify-content: end;
      gap: 13px;
      padding-top: 8px;
    }

    .form-actions .btn-primary {
      border: 0;
    }

    .form-actions button:disabled {
      opacity: .6;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 650px) {
      .event-form {
        padding: 24px;
      }

      .fields-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class EventFormComponent implements OnInit {
  eventId = signal<number | null>(null);
  isEditMode = signal(false);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  eventForm = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    category: new FormControl('House', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true }),
    date: new FormControl('', { nonNullable: true }),
    price: new FormControl<number | null>(0),
    capacity: new FormControl<number | null>(100)
  });

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.eventId.set(id);
      this.isEditMode.set(true);
      this.loadEvent(id);
    }
  }

  loadEvent(id: number): void {
    this.loading.set(true);

    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.eventForm.patchValue({
          title: event.title,
          description: event.description,
          category: event.category,
          city: event.city,
          location: event.location,
          date: this.dateForInput(event.date),
          price: event.price,
          capacity: event.capacity
        });

        this.imagePreview.set(event.image_url);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Non è stato possibile caricare l evento da modificare.');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.error.set('');
    this.selectedFile.set(file);

    if (!file) {
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.error.set('Formato immagine non valido. Usa PNG, JPG, JPEG o WEBP.');
      this.selectedFile.set(null);
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  submitEvent(): void {
    this.error.set('');
    this.success.set('');

    const values = this.eventForm.getRawValue();

    const title = values.title.trim();
    const description = values.description.trim();
    const category = values.category.trim();
    const city = values.city.trim();
    const location = values.location.trim();
    const date = values.date.trim();
    const price = Number(values.price);
    const capacity = Number(values.capacity);

    const missingFields: string[] = [];

    if (!title) {
      missingFields.push('titolo');
    }

    if (!description) {
      missingFields.push('descrizione');
    }

    if (!category) {
      missingFields.push('genere');
    }

    if (!date) {
      missingFields.push('data e ora');
    }

    if (!city) {
      missingFields.push('città');
    }

    if (!location) {
      missingFields.push('location');
    }

    if (missingFields.length > 0) {
      this.error.set(
        `Compila i seguenti campi: ${missingFields.join(', ')}.`
      );
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      this.error.set('Inserisci un prezzo valido.');
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      this.error.set('Inserisci un numero di posti valido.');
      return;
    }

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('city', city);
    formData.append('location', location);
    formData.append('date', date);
    formData.append('price', String(price));
    formData.append('capacity', String(capacity));

    const image = this.selectedFile();

    if (image) {
      formData.append('image', image, image.name);
    }

    this.saving.set(true);

    const id = this.eventId();

    const request = this.isEditMode() && id
      ? this.eventService.updateEvent(id, formData)
      : this.eventService.createEvent(formData);

    request.subscribe({
      next: (event: EventItem) => {
        this.saving.set(false);
        this.router.navigate(['/eventi', event.id]);
      },
      error: (response) => {
        this.saving.set(false);
        this.error.set(
          response.error?.message ||
          'Non è stato possibile salvare l evento.'
        );
      }
    });
  }

  dateForInput(date: string): string {
    const parsedDate = new Date(date);
    const offset = parsedDate.getTimezoneOffset() * 60000;

    return new Date(parsedDate.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  }
}
