from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    """
    Registrazione utente
    ---
    tags:
      - Auth
    """
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "Campi obbligatori mancanti"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email già registrata"}), 409

    user = User(name=name, email=email, role="user")
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Utente registrato correttamente"}), 201


@auth_bp.post("/login")
def login():
    """
    Login utente
    ---
    tags:
      - Auth
    """
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Credenziali non valide"}), 401

    if user.is_banned:
        return jsonify({"message": "Utente bannato"}), 403

    claims = {
        "role": user.role,
        "email": user.email,
        "name": user.name
    }

    access_token = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=claims)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "email": user.email,
            "name": user.name
        }
    )

    return jsonify({"access_token": access_token})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })


@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    user.name = data.get("name", user.name)

    if data.get("password"):
        user.set_password(data["password"])

    db.session.commit()

    return jsonify({"message": "Profilo aggiornato"})
