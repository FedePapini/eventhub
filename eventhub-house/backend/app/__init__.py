import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from flasgger import Swagger
from sqlalchemy.engine import URL

from app.extensions import db, migrate, jwt, cors


BASE_DIR = Path(__file__).resolve().parent.parent


def create_app(test_config=None):
    load_dotenv(BASE_DIR / ".env")

    aiven_env_file = BASE_DIR / ".env.aiven"

    if test_config is None and aiven_env_file.exists():
        load_dotenv(aiven_env_file, override=True)

    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret-key")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")

    if test_config is None and os.getenv("AIVEN_MYSQL_HOST"):
        ca_path = os.getenv("AIVEN_MYSQL_CA")

        app.config["SQLALCHEMY_DATABASE_URI"] = URL.create(
            drivername="mysql+pymysql",
            username=os.getenv("AIVEN_MYSQL_USER"),
            password=os.getenv("AIVEN_MYSQL_PASSWORD"),
            host=os.getenv("AIVEN_MYSQL_HOST"),
            port=int(os.getenv("AIVEN_MYSQL_PORT", "3306")),
            database=os.getenv("AIVEN_MYSQL_DATABASE"),
            query={"charset": "utf8mb4"}
        )

        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "connect_args": {
                "ssl": {
                    "ca": ca_path
                }
            },
            "pool_pre_ping": True,
            "pool_recycle": 280
        }
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "DATABASE_URL",
            "sqlite:///eventhub.db"
        )

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    Swagger(app)

    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.bookings import bookings_bp
    from app.routes.reviews import reviews_bp
    from app.routes.admin import admin_bp
    from app.routes.organizer import organizer_bp
    from app.routes.artists import artists_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(organizer_bp, url_prefix="/api/organizer")
    app.register_blueprint(artists_bp, url_prefix="/api/artists")

    @app.route("/")
    def home():
        return {
            "message": "EventHub House API",
            "docs": "/apidocs"
        }

    return app
