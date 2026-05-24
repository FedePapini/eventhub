import csv
from io import StringIO
from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import Event, Booking
from app.utils import role_required

organizer_bp = Blueprint("organizer", __name__)


def can_manage_event(event, user_id, role):
    return role == "admin" or event.organizer_id == int(user_id)


@organizer_bp.get("/dashboard")
@jwt_required()
@role_required("organizer", "admin")
def dashboard():
    user_id = get_jwt_identity()
    role = get_jwt().get("role")

    if role == "admin":
        events = Event.query.order_by(Event.date.asc()).all()
    else:
        events = Event.query.filter_by(
            organizer_id=int(user_id)
        ).order_by(Event.date.asc()).all()

    dashboard_data = []

    for event in events:
        enrolled = event.booked_count
        estimated_revenue = round(enrolled * event.price, 2)

        dashboard_data.append({
            "id": event.id,
            "title": event.title,
            "date": event.date.isoformat(),
            "city": event.city,
            "capacity": event.capacity,
            "enrolled": enrolled,
            "available_places": event.available_places,
            "estimated_revenue": estimated_revenue,
            "average_rating": event.average_rating
        })

    total_enrolled = sum(item["enrolled"] for item in dashboard_data)
    total_revenue = round(
        sum(item["estimated_revenue"] for item in dashboard_data),
        2
    )

    return jsonify({
        "summary": {
            "total_events": len(dashboard_data),
            "total_enrolled": total_enrolled,
            "total_estimated_revenue": total_revenue
        },
        "events": dashboard_data
    })


@organizer_bp.get("/events/<int:event_id>/attendees")
@jwt_required()
@role_required("organizer", "admin")
def attendees(event_id):
    user_id = get_jwt_identity()
    role = get_jwt().get("role")

    event = Event.query.get_or_404(event_id)

    if not can_manage_event(event, user_id, role):
        return jsonify({"message": "Non puoi gestire questo evento"}), 403

    bookings = Booking.query.filter_by(event_id=event_id).all()

    attendees_data = [
        {
            "booking_id": booking.id,
            "name": booking.user.name,
            "email": booking.user.email,
            "ticket_code": booking.qr_code,
            "booking_date": booking.created_at.isoformat()
        }
        for booking in bookings
    ]

    return jsonify({
        "event": {
            "id": event.id,
            "title": event.title
        },
        "attendees": attendees_data
    })


@organizer_bp.get("/events/<int:event_id>/attendees/export")
@jwt_required()
@role_required("organizer", "admin")
def export_attendees_csv(event_id):
    user_id = get_jwt_identity()
    role = get_jwt().get("role")

    event = Event.query.get_or_404(event_id)

    if not can_manage_event(event, user_id, role):
        return jsonify({"message": "Non puoi gestire questo evento"}), 403

    bookings = Booking.query.filter_by(event_id=event_id).all()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Nome",
        "Email",
        "Codice biglietto",
        "Data iscrizione"
    ])

    for booking in bookings:
        writer.writerow([
            booking.user.name,
            booking.user.email,
            booking.qr_code,
            booking.created_at.isoformat()
        ])

    filename = f"iscritti_evento_{event.id}.csv"

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
