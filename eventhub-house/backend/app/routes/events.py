import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models import Event
from app.utils import role_required, parse_date

events_bp = Blueprint("events", __name__)


def event_to_dict(event):
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "city": event.city,
        "location": event.location,
        "date": event.date.isoformat(),
        "price": event.price,
        "capacity": event.capacity,
        "booked_count": event.booked_count,
        "available_places": event.available_places,
        "average_rating": event.average_rating,
        "image_filename": event.image_filename,
        "organizer_id": event.organizer_id
    }


@events_bp.get("")
def list_events():
    """
    Lista eventi con filtri
    ---
    tags:
      - Events
    """
    query = Event.query

    search = request.args.get("search")
    category = request.args.get("category")
    city = request.args.get("city")

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))

    if category:
        query = query.filter(Event.category.ilike(f"%{category}%"))

    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))

    events = query.order_by(Event.date.asc()).all()

    return jsonify([event_to_dict(event) for event in events])


@events_bp.get("/featured")
def featured_events():
    events = Event.query.order_by(Event.date.asc()).limit(6).all()
    return jsonify([event_to_dict(event) for event in events])


@events_bp.get("/<int:event_id>")
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event_to_dict(event))


@events_bp.post("")
@jwt_required()
@role_required("organizer", "admin")
def create_event():
    """
    Crea evento
    ---
    tags:
      - Events
    """
    user_id = get_jwt_identity()

    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category", "House")
    city = request.form.get("city")
    location = request.form.get("location")
    date = request.form.get("date")
    price = float(request.form.get("price", 0))
    capacity = int(request.form.get("capacity", 0))

    if not title or not description or not city or not location or not date or not capacity:
        return jsonify({"message": "Campi obbligatori mancanti"}), 400

    image_filename = None

    if "image" in request.files:
        image = request.files["image"]
        if image.filename:
            filename = secure_filename(image.filename)
            os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
            image.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            image_filename = filename

    event = Event(
        title=title,
        description=description,
        category=category,
        city=city,
        location=location,
        date=parse_date(date),
        price=price,
        capacity=capacity,
        image_filename=image_filename,
        organizer_id=user_id
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event_to_dict(event)), 201


@events_bp.put("/<int:event_id>")
@jwt_required()
@role_required("organizer", "admin")
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json()

    event.title = data.get("title", event.title)
    event.description = data.get("description", event.description)
    event.category = data.get("category", event.category)
    event.city = data.get("city", event.city)
    event.location = data.get("location", event.location)
    event.price = data.get("price", event.price)
    event.capacity = data.get("capacity", event.capacity)

    if data.get("date"):
        event.date = parse_date(data["date"])

    db.session.commit()

    return jsonify(event_to_dict(event))


@events_bp.delete("/<int:event_id>")
@jwt_required()
@role_required("organizer", "admin")
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Evento eliminato"})
