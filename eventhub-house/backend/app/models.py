from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


event_artists = db.Table(
    "event_artists",
    db.Column("event_id", db.Integer, db.ForeignKey("event.id"), primary_key=True),
    db.Column("artist_id", db.Integer, db.ForeignKey("artist.id"), primary_key=True)
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), default="user")
    is_banned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    bookings = db.relationship("Booking", backref="user", lazy=True)
    reviews = db.relationship("Review", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Artist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    bio = db.Column(db.Text, default="")
    image_filename = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), default="House")
    city = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(180), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    price = db.Column(db.Float, default=0)
    capacity = db.Column(db.Integer, nullable=False)
    image_filename = db.Column(db.String(255))
    organizer_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organizer = db.relationship("User", backref="organized_events")

    artists = db.relationship(
        "Artist",
        secondary=event_artists,
        backref=db.backref("events", lazy="dynamic"),
        lazy="select"
    )

    @property
    def booked_count(self):
        return Booking.query.filter_by(event_id=self.id).count()

    @property
    def available_places(self):
        return max(self.capacity - self.booked_count, 0)

    @property
    def average_rating(self):
        reviews = Review.query.filter_by(event_id=self.id, is_reported=False).all()

        if not reviews:
            return None

        return round(sum(review.rating for review in reviews) / len(reviews), 1)


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    qr_code = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    event = db.relationship("Event", backref="bookings")

    __table_args__ = (
        db.UniqueConstraint("user_id", "event_id", name="unique_user_event_booking"),
    )


class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    is_reported = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    event = db.relationship("Event", backref="reviews")
