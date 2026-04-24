# Emmanuella Obidike
import os
import sys
from pathlib import Path

# Set test database
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Add backend to path so "import app..." works
BACKEND_DIR = Path(__file__).resolve().parents[2]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
