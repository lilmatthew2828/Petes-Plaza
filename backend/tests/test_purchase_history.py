# Jania Southall (whole file) - Tests for purchase history routes, covering successful retrieval of purchase history and item purchase flow, including edge cases like attempting to purchase an already sold item.
import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.routes.purchaseHistory import get_user_purchase_history, purchase_item


def test_get_user_purchase_history_success():
    db = MagicMock()
    current_user = SimpleNamespace(email="buyer@example.com")

    tx = SimpleNamespace(
        transaction_id=1,
        listing_id=10,
        seller_email="seller@example.com",
        transaction_timestamp="2026-04-20T10:00:00",
    )
    listing = SimpleNamespace(
        id=10,
        title="Laptop",
        description="Good condition",
        price=450.0,
        image_key="laptop.jpg",
    )
    seller = SimpleNamespace(
        email="seller@example.com",
        username="seller1",
        student_id=111111,
    )

    tx_query = MagicMock()
    tx_query.filter.return_value.order_by.return_value.all.return_value = [tx]

    listing_query = MagicMock()
    listing_query.filter.return_value.first.return_value = listing

    seller_query = MagicMock()
    seller_query.filter.return_value.first.return_value = seller

    db.query.side_effect = [tx_query, listing_query, seller_query]

    result = asyncio.run(get_user_purchase_history(current_user=current_user, db=db))

    assert len(result) == 1
    assert result[0]["listing_id"] == 10
    assert result[0]["title"] == "Laptop"
    assert result[0]["seller_name"] == "seller1"


def test_purchase_item_success():
    db = MagicMock()
    current_user = SimpleNamespace(email="buyer@example.com")

    listing = SimpleNamespace(
        id=5,
        status="active",
        seller_email="seller@example.com",
    )

    listing_query = MagicMock()
    listing_query.filter.return_value.first.return_value = listing

    existing_tx_query = MagicMock()
    existing_tx_query.filter.return_value.first.return_value = None

    db.query.side_effect = [listing_query, existing_tx_query]

    def fake_refresh(transaction):
        transaction.transaction_id = 77

    db.refresh.side_effect = fake_refresh

    result = asyncio.run(purchase_item(listing_id=5, current_user=current_user, db=db))

    assert result["message"] == "Item purchased successfully"
    assert result["transaction_id"] == 77
    assert listing.status == "sold"
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


def test_purchase_item_already_purchased_returns_500():
    db = MagicMock()
    current_user = SimpleNamespace(email="buyer@example.com")

    listing = SimpleNamespace(
        id=5,
        status="active",
        seller_email="seller@example.com",
    )
    existing_tx = SimpleNamespace(transaction_id=1)

    listing_query = MagicMock()
    listing_query.filter.return_value.first.return_value = listing

    existing_tx_query = MagicMock()
    existing_tx_query.filter.return_value.first.return_value = existing_tx

    db.query.side_effect = [listing_query, existing_tx_query]

    with pytest.raises(HTTPException) as exc:
        asyncio.run(purchase_item(listing_id=5, current_user=current_user, db=db))

    # Route catches HTTPException and rethrows as 500
    assert exc.value.status_code == 500
    assert "Item already purchased" in exc.value.detail