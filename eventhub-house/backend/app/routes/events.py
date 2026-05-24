import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models import Event, Booking, Review
from app.utils import role_required, parse_date

events_bp = Blueprint("events", __name__)

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def get_upload_folder():
    folder = os.path.abspath(
        os.path.join(
            current_app.root_path,
            "..",
            current_app.config["UPLOAD_FOLDER"]
        )
    )
    os.makedirs(folder, exist_ok=True)
    return folder


def allowed_image(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS
    )


def save_uploaded_image(image):
    if not image or not image.filename:
        return None

    if not allowed_image(image.filename):
        raise ValueError("Formato immagine non valido. Usa PNG, JPG, JPEG o WEBP.")

    original_filename = secure_filename(image.filename)
    unique_filename = f"{uuid.uuid4().hex[:12]}_{original_filename}"

    image.save(os.path.join(get_upload_folder(), unique_filename))

    return unique_filename


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
        "image_url": (
            f"/api/events/images/{event.image_filename}"
            if event.image_filename
            else None
        ),
        "organizer_id": event.organizer_id
    }


def can_manage_event(event):
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    return role == "admin" or event.organizer_id == user_id


@events_bp.get("")
def list_events():
    """
    Lista eventi con filtri
    ---
    tags:
      - Events
    """
    query = Event.query

    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    city = request.args.get("city", "").strip()

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


@events_bp.get("/images/<path:filename>")
def get_event_image(filename):
    return send_from_directory(get_upload_folder(), filename)


@events_bp.get("/<int:event_id>")
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event_to_dict(event))


@events_bp.post("")
@jwt_required()
@role_required("organizer", "admin")
def create_event():
    """
    Crea evento con locandina
    ---
    tags:
      - Events
    """
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "House").strip()
    city = request.form.get("city", "").strip()
    location = request.form.get("location", "").strip()
    date = request.form.get("date", "").strip()
    price = request.form.get("price", "0").strip()
    capacity = request.form.get("capacity", "0").strip()

    if not title or not description or not city or not location or not date:
        return jsonify({"message": "Compila tutti i campi obbligatori"}), 400

    try:
        parsed_date = parse_date(date)
        parsed_price = float(price)
        parsed_capacity = int(capacity)

        if parsed_price < 0:
            return jsonify({"message": "Il prezzo non può essere negativo"}), 400

        if parsed_capacity <= 0:
            return jsonify({"message": "La capienza deve essere maggiore di zero"}), 400
    except ValueError:
        return jsonify({"message": "Data, prezzo o capienza non validi"}), 400

    try:
        image_filename = save_uploaded_image(request.files.get("image"))
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    event = Event(
        title=title,
        description=description,
        category=category,
        city=city,
        location=location,
        date=parsed_date,
        price=parsed_price,
        capacity=parsed_capacity,
        image_filename=image_filename,
        organizer_id=int(get_jwt_identity())
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event_to_dict(event)), 201


@events_bp.put("/<int:event_id>")
@jwt_required()
@role_required("organizer", "admin")
def update_event(event_id):
    event = Event.query.get_or_404(event_id)

    if not can_manage_event(event):
        return jsonify({"message": "Non puoi modificare questo evento"}), 403

    data = request.form if request.form else (request.get_json() or {})

    event.title = data.get("title", event.title).strip()
    event.description = data.get("description", event.description).strip()
    event.category = data.get("category", event.category).strip()
    event.city = data.get("city", event.city).strip()
    event.location = data.get("location", event.location).strip()

    try:
        if data.get("date"):
            event.date = parse_date(data["date"])

        if data.get("price") is not None:
            event.price = float(data["price"])

        if data.get("capacity") is not None:
            event.capacity = int(data["capacity"])
    except ValueError:
        return jsonify({"message": "Data, prezzo o capienza non validi"}), 400

    if request.files.get("image"):
        try:
            event.image_filename = save_uploaded_image(request.files.get("image"))
        except ValueError as error:
            return jsonify({"message": str(error)}), 400

    db.session.commit()

    return jsonify(event_to_dict(event))


@events_bp.delete("/<int:event_id>")
@jwt_required()
@role_required("organizer", "admin")
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)

    if not can_manage_event(event):
        return jsonify({"message": "Non puoi eliminare questo evento"}), 403

    Booking.query.filter_by(event_id=event.id).delete()
    Review.query.filter_by(event_id=event.id).delete()

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Evento eliminato correttamente"})
