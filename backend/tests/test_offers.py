# Jania Southall (whole file) - Tests for offers routes, covering successful offer creation, unauthorized access to buyer offers, and successful response to an offer.
import pytest
from types import SimpleNamespace
from unittest.mock import MagicMock
from fastapi import HTTPException

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.routes.offers import (
    create_offer,
    get_buyer_offers,
    respond_to_offer,
    RespondRequest,
)


def test_create_offer_success():
    db = MagicMock()

    listing = SimpleNamespace(id=10, status="active", seller_email="seller@example.com")

    listing_query = MagicMock()
    listing_query.filter.return_value.first.return_value = listing

    existing_offer_query = MagicMock()
    existing_offer_query.filter.return_value.first.return_value = None

    db.query.side_effect = [listing_query, existing_offer_query]

    current_user = SimpleNamespace(email="buyer@example.com", is_admin=False)

    def fake_refresh(offer):
        offer.offer_id = 123

    db.refresh.side_effect = fake_refresh

    result = create_offer(listing_id=10, db=db, current_user=current_user)

    assert result["message"] == "Interest expressed successfully"
    assert result["offer_id"] == 123
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


def test_get_buyer_offers_unauthorized():
    db = MagicMock()
    current_user = SimpleNamespace(email="other@example.com", is_admin=False)

    with pytest.raises(HTTPException) as exc:
        get_buyer_offers(
            buyer_email="buyer@example.com",
            db=db,
            current_user=current_user,
        )

    assert exc.value.status_code == 403
    assert exc.value.detail == "Not authorized"


def test_respond_to_offer_success():
    db = MagicMock()

    offer = SimpleNamespace(
        offer_id=1,
        seller_email="seller@example.com",
        status="pending",
        seller_message=None,
        updated_at=None,
    )

    offer_query = MagicMock()
    offer_query.filter.return_value.first.return_value = offer
    db.query.return_value = offer_query

    current_user = SimpleNamespace(email="seller@example.com", is_admin=False)
    request = RespondRequest(message="Pickup at library at 5 PM")

    result = respond_to_offer(
        offer_id=1,
        request=request,
        db=db,
        current_user=current_user,
    )

    assert result["message"] == "Response sent successfully"
    assert offer.seller_message == "Pickup at library at 5 PM"
    assert offer.status == "accepted"
    assert offer.updated_at is not None
    db.commit.assert_called_once()