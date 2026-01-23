# Python Backend - Testing Guide

## Overview

This project includes pytest tests for the Python FastAPI backend.

## Test Structure

```
backend-centralized/
├── tests/
│   ├── conftest.py           # Pytest fixtures and configuration
│   ├── test_services.py      # Service layer unit tests
│   └── test_api.py           # API endpoint tests
├── pyproject.toml
└── requirements.txt
```

## Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_services.py -v

# Run specific test
pytest tests/test_services.py::TestBillingService::test_calculate_invoice_total_basic -v
```

## Test Coverage

### Service Layer Tests
- Billing calculations
- Tenant validation
- Notification types
- Analytics metrics
- Camera integration

### API Endpoint Tests
- Health check endpoints
- Authentication validation
- Tenant management
- Billing operations
- Client management
- Input validation

## Fixture Usage

```python
@pytest.fixture
def client():
    """Test client fixture with in-memory database"""
    # Setup
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    # Teardown
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def mock_billing_service():
    """Mock billing service fixture"""
    with patch('app.services.billing_service.BillingService') as mock:
        yield mock.return_value
```

## Writing New Tests

```python
from fastapi.testclient import TestClient

class TestYourFeature:
    def test_success_case(self, client):
        response = client.post("/api/v1/your-endpoint", json={
            "field": "value"
        })
        assert response.status_code == 200
        assert "expected_key" in response.json()
    
    def test_validation_error(self, client):
        response = client.post("/api/v1/your-endpoint", json={})
        assert response.status_code == 422  # Validation error
```

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Python Tests
  run: |
    cd backend-centralized
    pip install -r requirements.txt
    pytest tests/ -v --tb=short
```

## Coverage Requirements

- **Services**: Minimum 80%
- **API Endpoints**: Minimum 70%
- **Overall**: Minimum 75%
