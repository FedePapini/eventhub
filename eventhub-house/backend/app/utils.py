from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from datetime import datetime
import threading


def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")

            if role not in roles:
                return jsonify({"message": "Accesso non autorizzato"}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper


def fake_send_email_async(to_email, subject, body):
    def task():
        print("EMAIL ASINCRONA")
        print("A:", to_email)
        print("Oggetto:", subject)
        print("Testo:", body)

    thread = threading.Thread(target=task)
    thread.start()


def parse_date(date_string):
    return datetime.fromisoformat(date_string)
