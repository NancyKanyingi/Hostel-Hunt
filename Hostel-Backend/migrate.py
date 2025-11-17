#!/usr/bin/env python3
"""
Database migration script for Hostel-Hunt application.
This script creates all database tables defined in the SQLAlchemy models.
"""

import os
from app import create_app

def run_migrations():
    """Create all database tables."""
    app = create_app()

    with app.app_context():
        from app.extensions.db import db
        print("Creating database tables...")
        try:
            db.create_all()
            print("Database tables created successfully!")
        except Exception as e:
            print(f"Error creating tables: {e}")
            print("Please check your DATABASE_URL environment variable and Supabase connection.")

if __name__ == "__main__":
    # Check if DATABASE_URL is set
    if not os.getenv("DATABASE_URL"):
        print("ERROR: DATABASE_URL environment variable not set!")
        print("Please set your Supabase DATABASE_URL:")
        print("export DATABASE_URL='postgresql://postgres:[YOUR_PASSWORD]@db.aszxbqidejznlzvfxqnv.supabase.co:5432/postgres'")
        exit(1)

    run_migrations()