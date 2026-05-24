from datetime import datetime, timedelta
import pytest
from app import create_app
from app.extensions import db
from app.models import Event, User


@pytest.fixture()
def app():
    test_app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-jwt-secret-key",
        "SECRET_KEY": "test-secret-key",
        "UPLOAD_FOLDER": "uploads"
    })

    with test_app.app_context():
        db.create_all()

        user = User(
            name="Test User",
            email="user@test.local",
            role="user"
        )
        user.set_password("password")

        organizer = User(
            name="Test Organizer",
            email="organizer@test.local",
            role="organizer"
        )
        organizer.set_password("password")

        db.session.add_all([user, organizer])
        db.session.commit()

        event = Event(
            title="Test House Night",
            description="Evento di test per controllare le prenotazioni.",
            category="House",
            city="Milano",
            location="Test Club",
            date=datetime.utcnow() + timedelta(days=10),
            price=20.00,
            capacity=2,
            organizer_id=organizer.id
        )

        db.session.add(event)
        db.session.commit()

    yield test_app

    with test_app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def login(client, email, password="password"):
    response = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })

    assert response.status_code == 200

    return response.get_json()["access_token"]


def auth_header(token):
    return {
        "Authorization": f"Bearer {token}"
    }


def test_register_and_login_user(client):
    register_response = client.post("/api/auth/register", json={
        "name": "Nuova Utente",
        "email": "nuova@test.local",
        "password": "password123"
    })

    assert register_response.status_code == 201
    assert register_response.get_json()["message"] == "Utente registrato correttamente"

    login_response = client.post("/api/auth/login", json={
        "email": "nuova@test.local",
        "password": "password123"
    })

    assert login_response.status_code == 200

    login_data = login_response.get_json()

    assert "access_token" in login_data
    assert "refresh_token" in login_data
    assert login_data["user"]["email"] == "nuova@test.local"
    assert login_data["user"]["role"] == "user"


def test_user_can_book_event_and_view_ticket(client):
    token = login(client, "user@test.local")

    booking_response = client.post(
        "/api/bookings/event/1",
        headers=auth_header(token)
    )

    assert booking_response.status_code == 201

    booking_data = booking_response.get_json()

    assert booking_data["message"] == "Iscrizione completata"
    assert booking_data["ticket"]["event"]["title"] == "Test House Night"
    assert booking_data["ticket"]["qr_code"].startswith("EVENTHUB-1-")

    tickets_response = client.get(
        "/api/bookings/my-tickets",
        headers=auth_header(token)
    )

    assert tickets_response.status_code == 200

    tickets = tickets_response.get_json()

    assert len(tickets) == 1
    assert tickets[0]["event"]["title"] == "Test House Night"

    event_response = client.get("/api/events/1")
    event = event_response.get_json()

    assert event["booked_count"] == 1
    assert event["available_places"] == 1


def test_organizer_can_create_event(client):
    token = login(client, "organizer@test.local")

    create_response = client.post(
        "/api/events",
        headers=auth_header(token),
        data={
            "title": "New Deep House Sunset",
            "description": "Nuova serata deep house creata durante il test automatico.",
            "category": "Deep House",
            "city": "Roma",
            "location": "Sunset Terrace",
            "date": (datetime.utcnow() + timedelta(days=20)).isoformat(timespec="minutes"),
            "price": "24.50",
            "capacity": "180"
        },
        content_type="multipart/form-data"
    )

    assert create_response.status_code == 201

    created_event = create_response.get_json()

    assert created_event["title"] == "New Deep House Sunset"
    assert created_event["category"] == "Deep House"
    assert created_event["city"] == "Roma"
    assert created_event["capacity"] == 180
    assert created_event["available_places"] == 180


def test_normal_user_cannot_create_event(client):
    token = login(client, "user@test.local")

    response = client.post(
        "/api/events",
        headers=auth_header(token),
        data={
            "title": "Evento Non Autorizzato",
            "description": "Questo evento non dovrebbe essere creato da un utente normale.",
            "category": "House",
            "city": "Torino",
            "location": "Blocked Club",
            "date": (datetime.utcnow() + timedelta(days=15)).isoformat(timespec="minutes"),
            "price": "10",
            "capacity": "50"
        },
        content_type="multipart/form-data"
    )

    assert response.status_code == 403
    assert response.get_json()["message"] == "Accesso non autorizzato"
