import uuid
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Booking, Event, User
from app.utils import fake_send_email_async

bookings_bp = Blueprint("bookings", __name__)


def booking_to_dict(booking):
    return {
        "id": booking.id,
        "qr_code": booking.qr_code,
        "created_at": booking.created_at.isoformat(),
        "event": {
            "id": booking.event.id,
            "title": booking.event.title,
            "date": booking.event.date.isoformat(),
            "city": booking.event.city,
            "location": booking.event.location,
            "price": booking.event.price,
            "image_filename": booking.event.image_filename,
            "image_url": (
                f"/api/events/images/{booking.event.image_filename}"
                if booking.event.image_filename
                else None
            )
        }
    }


@bookings_bp.get("/my-tickets")
@jwt_required()
def my_tickets():
    user_id = get_jwt_identity()

    bookings = Booking.query.filter_by(user_id=user_id).order_by(
        Booking.created_at.desc()
    ).all()

    return jsonify([booking_to_dict(booking) for booking in bookings])


@bookings_bp.post("/event/<int:event_id>")
@jwt_required()
def book_event(event_id):
    user_id = get_jwt_identity()

    user = User.query.get_or_404(user_id)
    event = Event.query.get_or_404(event_id)

    existing_booking = Booking.query.filter_by(
        user_id=user_id,
        event_id=event_id
    ).first()

    if existing_booking:
        return jsonify({"message": "Sei già iscritto a questo evento"}), 409

    if event.available_places <= 0:
        return jsonify({"message": "Posti esauriti"}), 400

    booking = Booking(
        user_id=user_id,
        event_id=event_id,
        qr_code=f"EVENTHUB-{event_id}-{user_id}-{uuid.uuid4().hex[:10].upper()}"
    )

    db.session.add(booking)
    db.session.commit()

    fake_send_email_async(
        user.email,
        "Conferma iscrizione EventHub",
        f"Sei iscritto all'evento {event.title}. Codice biglietto: {booking.qr_code}"
    )

    return jsonify({
        "message": "Iscrizione completata",
        "ticket": booking_to_dict(booking)
    }), 201


@bookings_bp.delete("/event/<int:event_id>")
@jwt_required()
def cancel_booking(event_id):
    user_id = get_jwt_identity()

    booking = Booking.query.filter_by(
        user_id=user_id,
        event_id=event_id
    ).first()

    if not booking:
        return jsonify({"message": "Iscrizione non trovata"}), 404

    db.session.delete(booking)
    db.session.commit()

    return jsonify({"message": "Iscrizione annullata"})
