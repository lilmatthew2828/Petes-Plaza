
# Jania Southall (whole file) - Tests for authentication routes, covering successful registration, login, and handling of invalid credentials.
import sys
from pathlib import Path

# Ensure /backend is on PYTHONPATH so `import app...` works
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import json
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.auth import register, login
from app.schemas import RegisterIn, LoginIn
from app.config import settings


def test_signup_success(monkeypatch):
    db = MagicMock()

    payload = RegisterIn(
        email="student@my.hamptonu.edu",
        username="student1",
        student_id=123456,
        password="Password123!",
        confirm_password="Password123!",
    )

    created_user = SimpleNamespace(
        email=payload.email,
        username=payload.username,
        student_id=payload.student_id,
    )

    def fake_create_user(db, email, username, student_id, password):
        return created_user

    monkeypatch.setattr("app.auth.create_user", fake_create_user)

    result = register(payload=payload, db=db)

    assert result.email == "student@my.hamptonu.edu"
    assert result.username == "student1"


def test_signup_rejects_wrong_email_domain():
    db = MagicMock()

    payload = RegisterIn(
        email="student@gmail.com",
        username="student1",
        student_id=123456,
        password="Password123!",
        confirm_password="Password123!",
    )

    with pytest.raises(HTTPException) as exc:
        register(payload=payload, db=db)

    assert exc.value.status_code == 400
    assert "Email must end with @my.hamptonu.edu" in exc.value.detail


def test_login_success_sets_cookie(monkeypatch):
    db = MagicMock()

    payload = LoginIn(identifier="student@my.hamptonu.edu", password="Password123!")
    fake_user = SimpleNamespace(
        id=1,
        email="student@my.hamptonu.edu",
        username="student1",
        student_id=123456,
        created_at="2026-01-01T00:00:00",
    )

    monkeypatch.setattr("app.auth.authenticate_user", lambda db, email, password: fake_user)
    monkeypatch.setattr("app.auth.authenticate_user_by_username", lambda db, username, password: None)
    monkeypatch.setattr("app.auth.create_session", lambda db, user_id: "test-session-token")

    response = login(payload=payload, db=db)

    assert response.status_code == 200
    body = json.loads(response.body)
    assert body["email"] == "student@my.hamptonu.edu"
    assert settings.session_cookie_name in response.headers.get("set-cookie", "").lower()


def test_login_invalid_credentials(monkeypatch):
    db = MagicMock()
    payload = LoginIn(identifier="student@my.hamptonu.edu", password="wrong")

    monkeypatch.setattr("app.auth.authenticate_user", lambda db, email, password: None)
    monkeypatch.setattr("app.auth.authenticate_user_by_username", lambda db, username, password: None)

    with pytest.raises(HTTPException) as exc:
        login(payload=payload, db=db)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid credentials"