from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Review
from app.utils import role_required

admin_bp = Blueprint("admin", __name__)


def user_to_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_banned": user.is_banned,
        "created_at": user.created_at.isoformat()
    }


def review_to_dict(review):
    return {
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "is_reported": review.is_reported,
        "created_at": review.created_at.isoformat(),
        "user": {
            "id": review.user.id,
            "name": review.user.name,
            "email": review.user.email
        },
        "event": {
            "id": review.event.id,
            "title": review.event.title
        }
    }


@admin_bp.get("/users")
@jwt_required()
@role_required("admin")
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([user_to_dict(user) for user in users])


@admin_bp.patch("/users/<int:user_id>/ban")
@jwt_required()
@role_required("admin")
def toggle_ban_user(user_id):
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if user.id == current_user_id:
        return jsonify({"message": "Non puoi bannare il tuo account"}), 400

    user.is_banned = not user.is_banned
    db.session.commit()

    message = "Utente bannato" if user.is_banned else "Ban rimosso"

    return jsonify({
        "message": message,
        "user": user_to_dict(user)
    })


@admin_bp.patch("/users/<int:user_id>/role")
@jwt_required()
@role_required("admin")
def update_user_role(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    new_role = data.get("role")

    if new_role not in ["user", "organizer", "admin"]:
        return jsonify({"message": "Ruolo non valido"}), 400

    user.role = new_role
    db.session.commit()

    return jsonify({
        "message": "Ruolo aggiornato",
        "user": user_to_dict(user)
    })


@admin_bp.get("/reviews/reported")
@jwt_required()
@role_required("admin")
def reported_reviews():
    reviews = Review.query.filter_by(
        is_reported=True
    ).order_by(Review.created_at.desc()).all()

    return jsonify([review_to_dict(review) for review in reviews])


@admin_bp.patch("/reviews/<int:review_id>/approve")
@jwt_required()
@role_required("admin")
def approve_review(review_id):
    review = Review.query.get_or_404(review_id)

    review.is_reported = False
    db.session.commit()

    return jsonify({"message": "Recensione approvata"})


@admin_bp.delete("/reviews/<int:review_id>")
@jwt_required()
@role_required("admin")
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)

    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Recensione eliminata"})
