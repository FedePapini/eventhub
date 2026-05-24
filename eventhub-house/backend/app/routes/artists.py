import os
import uuid
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Artist, Event
from app.utils import role_required

artists_bp = Blueprint("artists", __name__)

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def get_upload_folder():
    folder = os.path.abspath(
        os.path.join(
            current_app.root_path,
            "..",
            current_app.config["UPLOAD_FOLDER"],
            "artists"
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


def artist_to_dict(artist):
    return {
        "id": artist.id,
        "name": artist.name,
        "bio": artist.bio,
        "image_filename": artist.image_filename,
        "image_url": (
            f"/api/artists/images/{artist.image_filename}"
            if artist.image_filename
            else None
        )
    }


def event_to_card(event):
    return {
        "id": event.id,
        "title": event.title,
        "category": event.category,
        "city": event.city,
        "location": event.location,
        "date": event.date.isoformat(),
        "price": event.price,
        "image_url": (
            f"/api/events/images/{event.image_filename}"
            if event.image_filename
            else None
        )
    }


@artists_bp.get("")
def list_artists():
    artists = Artist.query.order_by(Artist.name.asc()).all()
    return jsonify([artist_to_dict(artist) for artist in artists])


@artists_bp.get("/images/<path:filename>")
def get_artist_image(filename):
    return send_from_directory(get_upload_folder(), filename)


@artists_bp.get("/<int:artist_id>")
def get_artist(artist_id):
    artist = Artist.query.get_or_404(artist_id)

    events = artist.events.order_by(Event.date.asc()).all()

    data = artist_to_dict(artist)
    data["events"] = [event_to_card(event) for event in events]

    return jsonify(data)


@artists_bp.post("")
@jwt_required()
@role_required("organizer", "admin")
def create_artist():
    name = request.form.get("name", "").strip()
    bio = request.form.get("bio", "").strip()

    if not name:
        return jsonify({"message": "Il nome artista è obbligatorio"}), 400

    try:
        image_filename = save_uploaded_image(request.files.get("image"))
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    artist = Artist(
        name=name,
        bio=bio,
        image_filename=image_filename
    )

    db.session.add(artist)
    db.session.commit()

    return jsonify(artist_to_dict(artist)), 201


@artists_bp.put("/<int:artist_id>")
@jwt_required()
@role_required("organizer", "admin")
def update_artist(artist_id):
    artist = Artist.query.get_or_404(artist_id)

    name = request.form.get("name", artist.name).strip()
    bio = request.form.get("bio", artist.bio).strip()

    if not name:
        return jsonify({"message": "Il nome artista è obbligatorio"}), 400

    artist.name = name
    artist.bio = bio

    if request.files.get("image"):
        try:
            artist.image_filename = save_uploaded_image(request.files.get("image"))
        except ValueError as error:
            return jsonify({"message": str(error)}), 400

    db.session.commit()

    return jsonify(artist_to_dict(artist))


@artists_bp.delete("/<int:artist_id>")
@jwt_required()
@role_required("organizer", "admin")
def delete_artist(artist_id):
    artist = Artist.query.get_or_404(artist_id)

    if artist.events.count() > 0:
        return jsonify({
            "message": "Non puoi eliminare un artista collegato a uno o più eventi"
        }), 400

    db.session.delete(artist)
    db.session.commit()

    return jsonify({"message": "Artista eliminato correttamente"})
