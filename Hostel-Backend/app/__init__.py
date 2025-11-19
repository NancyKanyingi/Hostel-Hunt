from flask import Flask, send_from_directory
from config import Config
# app/__init__.py
from .routes.admin import admin_bp  # your admin routes

# Import CORS
from flask_cors import CORS

# Import extensions
from .extensions.db import db
from flask_migrate import Migrate
from .extensions.jwt import jwt
try:
    from .extensions.mail import mail
except Exception:
    mail = None

# Import blueprints
from .routes.auth import auth_bp
try:
    from .routes.hostels import hostels_bp
except Exception:
    hostels_bp = None
try:
    from .routes.users import users_bp
except Exception:
    users_bp = None
try:
    from .routes.bookings import bookings_bp
except Exception as e:
    # Log why bookings blueprint failed to import so we can diagnose missing /bookings/ routes
    print("[startup] Failed to import bookings_bp:", repr(e))
    bookings_bp = None
try:
    from .routes.review import reviews_bp
except Exception:
    reviews_bp = None
try:
    from .routes.search import search_bp
except Exception:
    search_bp = None
try:
    from .routes.analytics import analytics_bp
except Exception:
    analytics_bp = None


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize CORS properly
    CORS(
        app,
        origins=app.config['CORS_ORIGINS'],  # now always a list
        methods=app.config['CORS_METHODS'],
        allow_headers=app.config['CORS_ALLOW_HEADERS'],
        supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS']
    )

    # Initialize extensions
    db.init_app(app)
    with app.app_context():
        db.create_all()
    Migrate(app, db)

    try:
        jwt.init_app(app)
    except Exception:
        pass

    try:
        if mail is not None:
            mail.init_app(app)
    except Exception:
        pass

    # Register blueprints
    app.register_blueprint(auth_bp)
    if hostels_bp: app.register_blueprint(hostels_bp, url_prefix="/hostels")
    if users_bp: app.register_blueprint(users_bp, url_prefix="/users")
    if bookings_bp: app.register_blueprint(bookings_bp)
    if reviews_bp: app.register_blueprint(reviews_bp, url_prefix="/reviews")
    if search_bp: app.register_blueprint(search_bp, url_prefix="/search")
    if analytics_bp: app.register_blueprint(analytics_bp, url_prefix="/analytics")

    app.register_blueprint(admin_bp, url_prefix="/admin")

    # Debug: print bookings-related routes at startup so we can verify /bookings/ is registered
    print("URL MAP (bookings-related rules) at startup:")
    for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
        if "bookings" in rule.rule:
            print(f"- {rule.rule}  methods={sorted(rule.methods)}  endpoint={rule.endpoint}")

    # Serve uploaded images
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app
