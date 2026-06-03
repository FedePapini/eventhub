from functools import wraps
from datetime import datetime
from threading import Thread

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def role_required(*allowed_roles):
    def role_decorator(func):

        @wraps(func)
        def wrapped_function(*args, **kwargs):
            verify_jwt_in_request()

            user_role = get_jwt().get("role")

            if user_role not in allowed_roles:
                return jsonify(
                    {"message": "Accesso non autorizzato"}
                ), 403

            return func(*args, **kwargs)

        return wrapped_function

    return role_decorator


def fake_send_email_async(recipient, subject, message):

    def send():
        print("EMAIL ASINCRONA")
        print(f"A: {recipient}")
        print(f"Oggetto: {subject}")
        print(f"Testo: {message}")

    Thread(target=send).start()


def parse_date(date_string):
    parsed_date = datetime.fromisoformat(date_string)
    return parsed_date