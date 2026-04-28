# Announcements Feature Test Documentation

This document explains how to run and verify the Announcements feature backend tests for Pete's Plaza.

## Overview

- `test_announcements.py`: Unit tests for all core logic of the Announcements feature, including creation, update, deletion, delivery scheduling, per-user delivery, marking as read, and unread count.

## Prerequisites

- Python 3.9+
- All backend dependencies installed:

  ```sh
  pip install -r backend/requirements.txt
  ```

## Running the Tests

From the project root, run:

```sh
pytest backend/app/pytests/test_announcements.py
```

## What is Tested?

- Creation, update, and deletion of announcements
- Scheduling and delivery to correct users
- Per-user delivery and read tracking
- Unread count logic
- All logic is tested in isolation using an in-memory SQLite database

## How to Verify Tests Work

- All tests should pass (green) with `pytest`.
- If a test fails, review the error message for details.
- Tests are isolated and repeatable—rerunning them should always yield the same results.

## Best Practices

- Keep tests simple, focused, and independent.
- Use fixtures for setup/teardown.
- Document new tests with clear docstrings and comments.

---

*These tests ensure the Announcements feature is robust, reliable, and ready for production.*
