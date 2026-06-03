import os
import uuid

import jwt
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


def user_to_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_banned": user.is_banned
    }


def issue_eventhub_tokens(user):
    claims = {
        "role": user.role,
        "email": user.email,
        "name": user.name
    }

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=claims
    )

    refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims=claims
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_to_dict(user)
    }


def get_keycloak_public_key(kid):
    issuer_url = os.getenv("KEYCLOAK_ISSUER_URL")

    if not issuer_url:
        raise RuntimeError("KEYCLOAK_ISSUER_URL non configurato")

    jwks_url = f"{issuer_url}/protocol/openid-connect/certs"
    response = requests.get(jwks_url, timeout=8)
    response.raise_for_status()

    jwks = response.json()

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    raise RuntimeError("Chiave pubblica Keycloak non trovata")


def verify_keycloak_token(token):
    issuer_url = os.getenv("KEYCLOAK_ISSUER_URL")
    audience = os.getenv("KEYCLOAK_AUDIENCE", "eventhub-frontend")

    if not issuer_url:
        raise RuntimeError("KEYCLOAK_ISSUER_URL non configurato")

    unverified_header = jwt.get_unverified_header(token)
    public_key = get_keycloak_public_key(unverified_header["kid"])

    try:
        return jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer_url,
            options={
                "verify_aud": False
            }
        )
    except jwt.PyJWTError as error:
        raise RuntimeError(f"Token Keycloak non valido: {error}") from error


def extract_keycloak_role(payload):
    roles = payload.get("realm_access", {}).get("roles", [])

    if "admin" in roles:
        return "admin"

    if "organizer" in roles:
        return "organizer"

    return "user"


def extract_keycloak_name(payload):
    full_name = payload.get("name")

    if full_name:
        return full_name

    first_name = payload.get("given_name", "")
    last_name = payload.get("family_name", "")
    combined = f"{first_name} {last_name}".strip()

    if combined:
        return combined

    return payload.get("preferred_username") or payload.get("email") or "Utente EventHub"


@auth_bp.post("/keycloak-login")
def keycloak_login():
    data = request.get_json() or {}
    token = data.get("token")

    if not token:
        return jsonify({"message": "Token Keycloak mancante"}), 400

    try:
        payload = verify_keycloak_token(token)
    except RuntimeError as error:
        return jsonify({"message": str(error)}), 401

    email = payload.get("email") or payload.get("preferred_username")

    if not email:
        return jsonify({"message": "Email non presente nel token Keycloak"}), 400

    email = email.lower().strip()
    role = extract_keycloak_role(payload)
    name = extract_keycloak_name(payload)

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(
            name=name,
            email=email,
            role=role
        )

        user.set_password(uuid.uuid4().hex)

        db.session.add(user)
    else:
        user.name = name
        user.role = role

    db.session.commit()

    if user.is_banned:
        return jsonify({"message": "Utente bannato"}), 403

    return jsonify(issue_eventhub_tokens(user))


@auth_bp.post("/register")
def register():
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
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Credenziali non valide"}), 401

    if user.is_banned:
        return jsonify({"message": "Utente bannato"}), 403

    return jsonify(issue_eventhub_tokens(user))


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

    return jsonify(user_to_dict(user))


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
