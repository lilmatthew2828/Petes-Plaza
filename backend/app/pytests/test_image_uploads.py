# IMAGE UPLOAD TESTS
import sys
from pathlib import Path


# Ensure backend is on path
BACKEND_DIR = Path(__file__).resolve().parents[2]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_upload_image_success(monkeypatch):
    def fake_upload(*args, **kwargs):
        return None

    monkeypatch.setattr("app.aws_s3.s3_client.upload_fileobj", fake_upload)

    response = client.post(
        "/api/uploads/upload-image",
        files={"file": ("test.png", b"data", "image/png")}
    )

    assert response.status_code == 200
    assert "image_key" in response.json()


def test_upload_image_unique_filename(monkeypatch):
    def fake_upload(*args, **kwargs):
        return None

    monkeypatch.setattr("app.aws_s3.s3_client.upload_fileobj", fake_upload)

    r1 = client.post("/api/uploads/upload-image",
        files={"file": ("test.png", b"data", "image/png")})
    r2 = client.post("/api/uploads/upload-image",
        files={"file": ("test.png", b"data", "image/png")})

    assert r1.json()["image_key"] != r2.json()["image_key"]


def test_upload_image_extension_preserved(monkeypatch):
    def fake_upload(*args, **kwargs):
        return None

    monkeypatch.setattr("app.aws_s3.s3_client.upload_fileobj", fake_upload)

    response = client.post(
        "/api/uploads/upload-image",
        files={"file": ("photo.jpg", b"data", "image/jpeg")}
    )

    assert response.json()["image_key"].endswith(".jpg")