import os
import pytest
from fastapi.testclient import TestClient

# Configure test environment variables
os.environ["ENVIRONMENT"] = "test"
os.environ["SUPABASE_URL"] = "https://mock-test.supabase.co"
os.environ["SUPABASE_KEY"] = "mock-anon-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock-service-key"
os.environ["GEMINI_API_KEY"] = "mock-gemini-key"
os.environ["GEMINI_MODEL"] = "gemini-2.5-flash"

from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer mock.user_12345"}

@pytest.fixture
def other_user_headers():
    return {"Authorization": "Bearer mock.user_67890"}
