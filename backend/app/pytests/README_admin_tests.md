# Admin Backend Unit Test Documentation

This documentation explains how to run and verify the admin backend unit tests for Pete's Plaza.

## Overview

There are two main test files for admin backend logic:

- `test_admin_service.py`: Unit tests for core admin service functions (business logic, not HTTP endpoints).
- `test_admin_routes.py`: End-to-end tests for FastAPI admin endpoints (HTTP API), including user, listing, and transaction management.

Both test files use an in-memory SQLite database for isolation and speed. No real data is affected.

## Prerequisites

- Python 3.9+
- All backend dependencies installed:

  ```sh
  pip install -r backend/requirements.txt
  ```

- (Optional but recommended) Run tests in a virtual environment.

## Running the Tests

From the project root, run:

```sh
pytest backend/app/pytests/
```

Or to run a specific file:

```sh
pytest backend/app/pytests/test_admin_service.py
pytest backend/app/pytests/test_admin_routes.py
```

## What is Tested?

### `test_admin_service.py`
- Core admin logic: suspending users, moderating listings, dashboard metrics, user/listing queries.
- All business logic is tested in isolation from the API layer.

### `test_admin_routes.py`
- All major admin API endpoints:
  - List, suspend, and fetch users
  - List, delete, and moderate listings
  - List and create transactions
  - User growth and active user stats
- Tests use FastAPI's `TestClient` for realistic HTTP requests.

## How to Verify Tests Work

- All tests should pass (green) with `pytest`.
- If a test fails, review the error message for details.
- Tests are isolated and repeatable—rerunning them should always yield the same results.

## Troubleshooting

- If you see import errors, ensure your PYTHONPATH includes the backend root, or run pytest from the project root.
- If you add new admin features, add corresponding tests in the appropriate file.

## Best Practices

- Keep tests simple, focused, and independent.
- Use fixtures for setup/teardown.
- Document new tests with clear docstrings and comments.

---

*These tests help ensure Pete's Plaza admin backend remains robust, reliable, and easy to maintain.*
