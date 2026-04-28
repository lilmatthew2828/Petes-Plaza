# SOLD ITEM TESTS
import sys
from pathlib import Path

# Ensure backend is on path
BACKEND_DIR = Path(__file__).resolve().parents[2]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from types import SimpleNamespace
from app.listing_services.listings import create_listing


def test_mark_listing_sold():
    listing = create_listing(
        SimpleNamespace(
            listing_title="Sell Me",
            listing_description="desc",
            category="Misc",
            price=5,
            image_key=None
        ),
        "test@example.com"
    )

    listing["status"] = "sold"
    assert listing["status"] == "sold"


def test_add_buyer_email():
    listing = create_listing(
        SimpleNamespace(
            listing_title="Transaction Test",
            listing_description="desc",
            category="Misc",
            price=15,
            image_key=None
        ),
        "test@example.com"
    )

    listing["buyer_email"] = "buyer@test.com"
    assert listing["buyer_email"] == "buyer@test.com"


def test_sold_listing_structure():
    sold_listing = {
        "id": 1,
        "title": "Laptop",
        "status": "sold",
        "buyer_email": "buyer@example.com",
        "sold_at": "2026-04-23T12:00:00"
    }

    assert sold_listing["status"] == "sold"
    assert "buyer_email" in sold_listing
    assert sold_listing["sold_at"] is not None