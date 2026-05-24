from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Review, Event, Booking

reviews_bp = Blueprint("reviews", __name__)


def review_to_dict(review):
    return {
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "is_reported": review.is_reported,
        "created_at": review.created_at.isoformat(),
        "user": {
            "id": review.user.id,
            "name": review.user.name
        }
    }


@reviews_bp.get("/event/<int:event_id>")
def event_reviews(event_id):
    Event.query.get_or_404(event_id)

    reviews = Review.query.filter_by(
        event_id=event_id,
        is_reported=False
    ).order_by(Review.created_at.desc()).all()

    return jsonify([review_to_dict(review) for review in reviews])


@reviews_bp.post("/event/<int:event_id>")
@jwt_required()
def create_review(event_id):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    data = request.get_json()

    rating = data.get("rating")
    comment = data.get("comment", "").strip()

    if not rating or not comment:
        return jsonify({"message": "Rating e commento sono obbligatori"}), 400

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"message": "Il rating deve essere compreso tra 1 e 5"}), 400

    if event.date > datetime.utcnow():
        return jsonify({
            "message": "Puoi recensire un evento solo dopo che si è svolto"
        }), 400

    booking = Booking.query.filter_by(
        user_id=user_id,
        event_id=event_id
    ).first()

    if not booking:
        return jsonify({
            "message": "Puoi recensire solo eventi a cui eri iscritto"
        }), 403

    existing_review = Review.query.filter_by(
        user_id=user_id,
        event_id=event_id
    ).first()

    if existing_review:
        return jsonify({"message": "Hai già recensito questo evento"}), 409

    review = Review(
        user_id=user_id,
        event_id=event_id,
        rating=rating,
        comment=comment
    )

    db.session.add(review)
    db.session.commit()

    return jsonify(review_to_dict(review)), 201


@reviews_bp.patch("/<int:review_id>/report")
@jwt_required()
def report_review(review_id):
    review = Review.query.get_or_404(review_id)

    review.is_reported = True
    db.session.commit()

    return jsonify({"message": "Recensione segnalata"})
