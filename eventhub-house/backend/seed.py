from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Event

app = create_app()

with app.app_context():
    admin = User.query.filter_by(email="admin@eventhub.local").first()
    organizer = User.query.filter_by(email="organizer@eventhub.local").first()
    user = User.query.filter_by(email="user@eventhub.local").first()

    if not admin:
        admin = User(
            name="Admin EventHub",
            email="admin@eventhub.local",
            role="admin"
        )
        admin.set_password("password")
        db.session.add(admin)

    if not organizer:
        organizer = User(
            name="DJ Organizer",
            email="organizer@eventhub.local",
            role="organizer"
        )
        organizer.set_password("password")
        db.session.add(organizer)

    if not user:
        user = User(
            name="House Lover",
            email="user@eventhub.local",
            role="user"
        )
        user.set_password("password")
        db.session.add(user)

    db.session.commit()

    if Event.query.count() == 0:
        events = [
            Event(
                title="Neon House Night",
                description="Una notte di house music, visual neon e DJ set internazionali.",
                category="House",
                city="Milano",
                location="Pulse Club",
                date=datetime.utcnow() + timedelta(days=12),
                price=25.00,
                capacity=350,
                organizer_id=organizer.id
            ),
            Event(
                title="Deep House Sunset",
                description="Deep house al tramonto con terrazza panoramica e cocktail bar.",
                category="Deep House",
                city="Roma",
                location="Skyline Terrace",
                date=datetime.utcnow() + timedelta(days=20),
                price=18.00,
                capacity=200,
                organizer_id=organizer.id
            ),
            Event(
                title="Warehouse Tech House",
                description="Tech house underground in una location industriale.",
                category="Tech House",
                city="Torino",
                location="Factory 21",
                date=datetime.utcnow() + timedelta(days=32),
                price=30.00,
                capacity=500,
                organizer_id=organizer.id
            ),
            Event(
                title="Classic House Reunion",
                description="Evento passato utile per provare la funzionalità recensioni.",
                category="Classic House",
                city="Bologna",
                location="Groove Hall",
                date=datetime.utcnow() - timedelta(days=7),
                price=15.00,
                capacity=150,
                organizer_id=organizer.id
            )
        ]

        db.session.add_all(events)
        db.session.commit()

    print("Database popolato correttamente.")
    print("")
    print("ACCOUNT DEMO:")
    print("Admin:       admin@eventhub.local / password")
    print("Organizer:   organizer@eventhub.local / password")
    print("User:        user@eventhub.local / password")
