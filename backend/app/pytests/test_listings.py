# Emmanuella Obidike - Pytest unit tests for Listings, Image Uploads, and Sold Items functions

import sys
from pathlib import Path

# Ensure backend is on path
BACKEND_DIR = Path(__file__).resolve().parents[2]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from types import SimpleNamespace
import pytest
from app.listing_services.listings import create_listing, get_single_listing


def test_create_listing_success():
    listing = create_listing(
        SimpleNamespace(
            listing_title="Test Item",
            listing_description="Nice item",
            category="Books",
            price=10.0,
            image_key="test.jpg"
        ),
        "test@example.com"
    )

    assert listing["title"] == "Test Item"
    assert listing["price"] == 10.0


def test_create_listing_allows_negative_price():
    listing = create_listing(
        SimpleNamespace(
            listing_title="Bad",
            listing_description="Bad",
            category="Books",
            price=-5,
            image_key=None
        ),
        "test@example.com"
    )

    assert listing["price"] == -5


def test_get_single_listing_not_found():
    result = get_single_listing(999)
    assert result["message"] == "listing not found"