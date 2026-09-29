import os
import sqlite3
import hashlib
import secrets
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "farmer_history.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    print(f"Initializing database at: {DB_PATH}...")
    conn = get_db_connection()
    cursor = conn.cursor()

    # ── Users table ──────────────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL UNIQUE,
            village     TEXT,
            password_hash TEXT  NOT NULL,
            token       TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── Query history table (now user-linked) ────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS query_history (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id           INTEGER,
            timestamp         DATETIME DEFAULT CURRENT_TIMESTAMP,
            N                 REAL NOT NULL,
            P                 REAL NOT NULL,
            K                 REAL NOT NULL,
            temperature       REAL NOT NULL,
            humidity          REAL NOT NULL,
            ph                REAL NOT NULL,
            rainfall          REAL NOT NULL,
            crop1             TEXT NOT NULL,
            crop1_prob        REAL NOT NULL,
            crop2             TEXT NOT NULL,
            crop3             TEXT NOT NULL,
            fertilizer_type   TEXT,
            fertilizer_quantity REAL,
            lat               REAL,
            lon               REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()
    print("Database initialization complete.")

# ── Auth helpers ─────────────────────────────────────────────────────────────

def _hash_password(password: str) -> str:
    """SHA-256 hash with a fixed app salt (production: use bcrypt)."""
    salt = "CropAdvisorSalt2024"
    return hashlib.sha256((salt + password).encode()).hexdigest()

def register_user(name: str, phone: str, village: str, password: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check duplicate
    cursor.execute("SELECT id FROM users WHERE phone = ?", (phone,))
    if cursor.fetchone():
        conn.close()
        return None, "Phone number already registered."
    pw_hash = _hash_password(password)
    token = secrets.token_hex(32)
    cursor.execute(
        "INSERT INTO users (name, phone, village, password_hash, token) VALUES (?,?,?,?,?)",
        (name, phone, village, pw_hash, token)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {"id": user_id, "name": name, "phone": phone, "village": village, "token": token}, None

def login_user(phone: str, password: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    pw_hash = _hash_password(password)
    cursor.execute(
        "SELECT id, name, phone, village FROM users WHERE phone = ? AND password_hash = ?",
        (phone, pw_hash)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None, "Invalid phone number or password."
    token = secrets.token_hex(32)
    cursor.execute("UPDATE users SET token = ? WHERE id = ?", (token, row["id"]))
    conn.commit()
    conn.close()
    return {"id": row["id"], "name": row["name"], "phone": row["phone"],
            "village": row["village"], "token": token}, None

def get_user_by_token(token: str):
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, phone, village FROM users WHERE token = ?", (token,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# ── History helpers ──────────────────────────────────────────────────────────

def save_query(N, P, K, temp, hum, ph, rain, crop1, crop1_prob, crop2, crop3,
               fert_type=None, fert_qty=None, lat=None, lon=None, user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO query_history
          (user_id, N, P, K, temperature, humidity, ph, rainfall,
           crop1, crop1_prob, crop2, crop3,
           fertilizer_type, fertilizer_quantity, lat, lon)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (user_id, N, P, K, temp, hum, ph, rain,
          crop1, crop1_prob, crop2, crop3, fert_type, fert_qty, lat, lon))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id

def get_history(limit=50, user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute(
            "SELECT * FROM query_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?",
            (user_id, limit)
        )
    else:
        cursor.execute("SELECT * FROM query_history ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_soil_trends(user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute(
            "SELECT timestamp, N, P, K, ph, crop1 FROM query_history WHERE user_id = ? ORDER BY timestamp ASC",
            (user_id,)
        )
    else:
        cursor.execute("SELECT timestamp, N, P, K, ph, crop1 FROM query_history ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == '__main__':
    init_db()
