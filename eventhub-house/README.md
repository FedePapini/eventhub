# EventHub House

**EventHub House** è una web application full-stack dedicata alla scoperta e alla gestione di eventi di musica elettronica house, deep house e tech house.

La piattaforma permette agli utenti di cercare eventi, prenotare biglietti digitali con QR code, visualizzare le lineup degli artisti e lasciare recensioni. Gli organizzatori possono creare e gestire eventi, caricare locandine, associare artisti alle serate e controllare iscritti e incassi. Gli amministratori possono gestire utenti, ruoli, ban e recensioni segnalate.

---

## Funzionalità principali

### Area pubblica

- Homepage con elenco automatico degli eventi disponibili.
- Ricerca eventi per titolo, genere musicale e città.
- Pagina dettaglio evento con:
  - locandina;
  - titolo, genere, data e ora;
  - location e città;
  - prezzo;
  - numero di posti disponibili;
  - descrizione;
  - lineup degli artisti;
  - recensioni pubblicate.
- Pagina pubblica dedicata a ogni artista.
- Visualizzazione degli eventi associati a ciascun artista.
- Registrazione di un nuovo account.
- Login con gestione dei ruoli.

### Area utente

- Prenotazione di un evento.
- Controllo automatico dei posti disponibili.
- Visualizzazione dei propri biglietti digitali.
- Generazione di QR code personale per ogni biglietto.
- Annullamento di una prenotazione.
- Visualizzazione e modifica del profilo personale.
- Cambio password.
- Pubblicazione di recensioni per eventi conclusi a cui l'utente ha partecipato.
- Segnalazione di recensioni inappropriate.

### Area organizer

- Dashboard riepilogativa con:
  - numero di eventi pubblicati;
  - numero totale di iscritti;
  - incasso stimato;
  - rating medio degli eventi.
- Creazione di nuovi eventi.
- Modifica degli eventi esistenti.
- Eliminazione degli eventi.
- Upload della locandina da file locale.
- Gestione degli artisti con:
  - nome;
  - biografia;
  - fotografia.
- Creazione della lineup selezionando gli artisti associati all'evento.
- Visualizzazione dell'elenco iscritti a ciascun evento.
- Esportazione della lista iscritti in formato CSV.

### Area admin

- Visualizzazione degli utenti registrati.
- Promozione di un utente al ruolo organizer.
- Rimozione del ruolo organizer.
- Ban e rimozione ban degli utenti.
- Protezione dell'account amministratore.
- Visualizzazione delle recensioni segnalate.
- Approvazione di una recensione segnalata.
- Eliminazione definitiva di una recensione segnalata.

---

## Tecnologie utilizzate

### Backend

- Python 3.12
- Flask
- Flask-SQLAlchemy
- Flask-Migrate / Alembic
- Flask-JWT-Extended
- Flask-CORS
- Flasgger / Swagger
- SQLite
- Pytest

### Frontend

- Angular
- TypeScript
- Standalone Components
- Reactive Forms
- Angular Router
- Route Guards per autenticazione e ruoli
- HTTP Interceptor per token JWT
- Angular Signals
- Libreria `qrcode`
- CSS responsive personalizzato

### Strumenti di sviluppo

- GitHub Repository
- GitHub Codespaces
- Git

---

## Ruoli della piattaforma

La piattaforma prevede tre ruoli principali.

| Ruolo | Permessi principali |
| --- | --- |
| Utente | Prenotare eventi, visualizzare biglietti, modificare il profilo, pubblicare e segnalare recensioni |
| Organizer | Tutte le funzioni utente, più gestione eventi, locandine, lineup, artisti, iscritti e CSV |
| Admin | Gestione utenti, ruoli, ban e moderazione recensioni |

---

## Struttura del progetto

```text
eventhub-house/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── artists.py
│   │   │   ├── auth.py
│   │   │   ├── bookings.py
│   │   │   ├── events.py
│   │   │   ├── organizer.py
│   │   │   └── reviews.py
│   │   ├── __init__.py
│   │   ├── extensions.py
│   │   ├── models.py
│   │   └── utils.py
│   ├── instance/
│   │   └── eventhub.db
│   ├── migrations/
│   ├── tests/
│   │   └── test_api.py
│   ├── uploads/
│   │   └── artists/
│   ├── .env.example
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── run.py
│   └── seed.py
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── guards/
│   │       │   └── services/
│   │       ├── models/
│   │       ├── pages/
│   │       │   ├── admin/
│   │       │   ├── artist-detail/
│   │       │   ├── artists-manager/
│   │       │   ├── event-detail/
│   │       │   ├── event-form/
│   │       │   ├── home/
│   │       │   ├── login/
│   │       │   ├── organizer-dashboard/
│   │       │   ├── profile/
│   │       │   ├── register/
│   │       │   └── tickets/
│   │       └── app.routes.ts
│   ├── proxy.conf.json
│   └── package.json
├── .gitignore
└── README.md
```

---

## Avvio del progetto in GitHub Codespaces

Il progetto viene avviato usando due terminali:

- un terminale per il backend Flask;
- un terminale per il frontend Angular.

### Prerequisiti

- Python 3.12
- Node.js e npm
- GitHub Codespaces oppure un ambiente locale compatibile

---

## Primo avvio del backend

Aprire un terminale e spostarsi nella cartella backend:

```bash
cd /workspaces/eventhub/eventhub-house/backend
```

Creare e attivare l'ambiente virtuale Python:

```bash
python -m venv .venv
source .venv/bin/activate
```

Installare le dipendenze:

```bash
pip install -r requirements.txt
```

Creare il file locale delle variabili d'ambiente partendo dall'esempio:

```bash
cp .env.example .env
```

Applicare le migrazioni del database:

```bash
flask --app run.py db upgrade
```

Inserire gli account e i dati demo:

```bash
python seed.py
```

Avviare il backend:

```bash
python run.py
```

Il backend sarà disponibile sulla porta:

```text
5000
```

---

## Riavvio del backend dopo il primo avvio

Quando database e dipendenze sono già presenti, bastano questi comandi:

```bash
cd /workspaces/eventhub/eventhub-house/backend
source .venv/bin/activate
python run.py
```

Il terminale deve restare aperto durante l'utilizzo del sito.

---

## Primo avvio del frontend

Aprire un secondo terminale e spostarsi nella cartella frontend:

```bash
cd /workspaces/eventhub/eventhub-house/frontend
```

Installare le dipendenze Angular:

```bash
npm install
```

Avviare il frontend:

```bash
npm start
```

Il frontend sarà disponibile sulla porta:

```text
4200
```

In GitHub Codespaces, aprire il pannello **Ports / Porte** e aprire nel browser la porta `4200`.

---

## Riavvio del frontend dopo il primo avvio

Quando le dipendenze sono già installate:

```bash
cd /workspaces/eventhub/eventhub-house/frontend
npm start
```

Il terminale deve restare aperto durante l'utilizzo del sito.

---

## Account demo

Dopo l'esecuzione del file `seed.py` sono disponibili i seguenti account dimostrativi:

| Ruolo | Email | Password |
| --- | --- | --- |
| Utente | `user@eventhub.local` | `password` |
| Organizer | `organizer@eventhub.local` | `password` |
| Admin | `admin@eventhub.local` | `password` |

Questi account servono esclusivamente per provare le funzionalità del progetto in ambiente di sviluppo.

---

## Database

Il progetto utilizza **SQLite** come database locale.

Il file database viene creato nella cartella:

```text
backend/instance/eventhub.db
```

Nel database vengono memorizzati:

- utenti registrati;
- ruoli e stato di ban;
- eventi;
- prenotazioni;
- biglietti e codici QR;
- recensioni;
- artisti;
- collegamenti tra eventi e lineup.

Il database locale è escluso dal repository tramite `.gitignore`, per evitare di pubblicare dati degli utenti o dati generati durante le prove.

---

## Sicurezza delle password

Le password non vengono salvate nel database in chiaro.

Ogni password viene trasformata in un hash sicuro tramite Werkzeug prima di essere memorizzata. Di conseguenza:

- l'amministratore può vedere email, nome, ruolo e stato dell'utente;
- nessuno può visualizzare dal pannello admin la password originale degli utenti;
- il login confronta la password inserita con l'hash memorizzato.

---

## File caricati

Le locandine degli eventi e le fotografie degli artisti vengono caricate dal computer dell'organizer e salvate localmente nel backend.

Percorsi utilizzati:

```text
backend/uploads/
backend/uploads/artists/
```

I file caricati durante le prove locali sono esclusi dal repository GitHub tramite `.gitignore`.

---

## API principali

Il frontend comunica con il backend tramite API REST.

### Autenticazione

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| POST | `/api/auth/register` | Registrazione utente |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Profilo utente autenticato |
| PUT | `/api/auth/profile` | Modifica profilo e password |

### Eventi

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| GET | `/api/events` | Lista eventi e ricerca |
| GET | `/api/events/:id` | Dettaglio evento |
| POST | `/api/events` | Creazione evento organizer |
| PUT | `/api/events/:id` | Modifica evento |
| DELETE | `/api/events/:id` | Eliminazione evento |

### Prenotazioni

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| POST | `/api/bookings/event/:id` | Prenotazione evento |
| GET | `/api/bookings/my-tickets` | Biglietti dell'utente |
| DELETE | `/api/bookings/event/:id` | Annullamento prenotazione |

### Recensioni

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| GET | `/api/reviews/event/:id` | Recensioni evento |
| POST | `/api/reviews/event/:id` | Pubblicazione recensione |
| PATCH | `/api/reviews/:id/report` | Segnalazione recensione |

### Organizer

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| GET | `/api/organizer/dashboard` | Statistiche organizer |
| GET | `/api/organizer/events/:id/attendees` | Lista iscritti |
| GET | `/api/organizer/events/:id/attendees/export` | Esportazione CSV |

### Artisti

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| GET | `/api/artists` | Lista artisti |
| GET | `/api/artists/:id` | Pagina artista e suoi eventi |
| POST | `/api/artists` | Creazione artista |
| PUT | `/api/artists/:id` | Modifica artista |
| DELETE | `/api/artists/:id` | Eliminazione artista |

### Admin

| Metodo | Endpoint | Funzione |
| --- | --- | --- |
| GET | `/api/admin/users` | Elenco utenti |
| PATCH | `/api/admin/users/:id/role` | Modifica ruolo |
| PATCH | `/api/admin/users/:id/ban` | Ban o rimozione ban |
| GET | `/api/admin/reviews/reported` | Recensioni segnalate |
| PATCH | `/api/admin/reviews/:id/approve` | Approvazione recensione |
| DELETE | `/api/admin/reviews/:id` | Eliminazione recensione |

---

## Documentazione Swagger

Il backend integra la documentazione Swagger tramite Flasgger.

Con il backend acceso, la documentazione API è raggiungibile aprendo la porta `5000` e visitando:

```text
/apidocs
```

---

## Test automatici backend

Il progetto include test automatici realizzati con `pytest`.

I test verificano:

- registrazione e login;
- generazione dei token JWT;
- prenotazione di un evento;
- creazione del biglietto digitale;
- aggiornamento dei posti disponibili;
- creazione evento da parte di un organizer;
- blocco della creazione evento per un utente normale.

Per eseguire i test:

```bash
cd /workspaces/eventhub/eventhub-house/backend
source .venv/bin/activate
pytest -q
```

Risultato atteso:

```text
4 passed
```

---

## Flusso consigliato per provare il progetto

### Test utente

1. Accedere come `user@eventhub.local`.
2. Aprire un evento futuro.
3. Prenotare il biglietto.
4. Aprire la pagina **Biglietti**.
5. Verificare il QR code.
6. Aprire un evento passato già prenotato.
7. Pubblicare una recensione.
8. Segnalare una recensione.

### Test organizer

1. Accedere come `organizer@eventhub.local`.
2. Aprire la dashboard Organizer.
3. Creare un artista con foto e biografia.
4. Creare oppure modificare un evento.
5. Caricare una locandina.
6. Selezionare gli artisti nella lineup.
7. Controllare il dettaglio evento.
8. Visualizzare gli iscritti.
9. Esportare il CSV.

### Test admin

1. Accedere come `admin@eventhub.local`.
2. Aprire la pagina Admin.
3. Promuovere un utente a organizer.
4. Provare ban e rimozione ban.
5. Visualizzare una recensione segnalata.
6. Approvarla oppure eliminarla.

---

## Autore

Progetto realizzato da Federico Papini.

