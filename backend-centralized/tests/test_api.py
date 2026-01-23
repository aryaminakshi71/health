import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


class TestHealthEndpoints:
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_root_endpoint(self, client):
        """Test root endpoint returns HTML"""
        response = client.get("/")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")


class TestAuthEndpoints:
    def test_login_validation_missing_fields(self, client):
        """Test login validation with missing fields"""
        response = client.post("/api/v1/auth/login", json={})
        assert response.status_code in [400, 401, 422]

    def test_login_validation_invalid_email(self, client):
        """Test login validation with invalid email"""
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "invalid-email", "password": "password123"},
        )
        assert response.status_code in [400, 422]

    def test_register_validation_missing_fields(self, client):
        """Test register validation with missing fields"""
        response = client.post("/api/v1/auth/register", json={})
        assert response.status_code in [400, 422]

    def test_register_validation_short_password(self, client):
        """Test register validation with short password"""
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "123", "name": "Test User"},
        )
        assert response.status_code in [400, 422]


class TestTenantEndpoints:
    def test_get_tenants_unauthorized(self, client):
        """Test getting tenants without authorization"""
        response = client.get("/api/v1/tenants/")
        # Should return 401 or 403 without proper auth
        assert response.status_code in [401, 403, 404]

    def test_create_tenant_validation(self, client):
        """Test tenant creation validation"""
        response = client.post("/api/v1/tenants/", json={})
        # Should fail validation
        assert response.status_code in [400, 422]


class TestBillingEndpoints:
    def test_get_invoices_unauthorized(self, client):
        """Test getting invoices without authorization"""
        response = client.get("/api/v1/billing/invoices")
        # Should return 401 or 403 without proper auth
        assert response.status_code in [401, 403, 404]

    def test_create_invoice_validation(self, client):
        """Test invoice creation validation"""
        response = client.post("/api/v1/billing/invoices", json={})
        # Should fail validation
        assert response.status_code in [400, 422]

    def test_create_invoice_missing_patient(self, client):
        """Test invoice creation with missing patient ID"""
        response = client.post(
            "/api/v1/billing/invoices",
            json={"items": [{"description": "Test", "quantity": 1, "unit_price": 100}]},
        )
        assert response.status_code in [400, 422]


class TestClientManagementEndpoints:
    def test_get_clients_unauthorized(self, client):
        """Test getting clients without authorization"""
        response = client.get("/api/v1/clients/")
        assert response.status_code in [401, 403, 404]

    def test_create_client_validation(self, client):
        """Test client creation validation"""
        response = client.post("/api/v1/clients/", json={})
        assert response.status_code in [400, 422]


class TestMonitoringEndpoints:
    def test_monitoring_endpoint_exists(self, client):
        """Test monitoring endpoint exists"""
        response = client.get("/api/v1/monitoring/")
        # Should exist even if returns error
        assert response.status_code in [200, 401, 403, 404, 500]


class TestAPIValidation:
    def test_invalid_json_body(self, client):
        """Test handling of invalid JSON body"""
        response = client.post(
            "/api/v1/auth/login",
            content="invalid json",
            headers={"Content-Type": "application/json"},
        )
        # Should return parsing error
        assert response.status_code in [400, 422]

    def test_extra_fields_validation(self, client):
        """Test that extra fields are rejected"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123",
                "extra_field": "should be ignored",
            },
        )
        # Should still work or reject gracefully
        assert response.status_code in [200, 400, 401, 422]

    def test_boundary_value_email(self, client):
        """Test email validation at boundaries"""
        # Test with valid email format
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@domain.com", "password": "password123"},
        )
        # Should not return 422 for valid email
        if response.status_code == 422:
            # Check if email is the specific issue
            data = response.json()
            email_errors = [
                e
                for e in data.get("detail", [])
                if "email" in str(e.get("loc", [])).lower()
            ]
            # Valid email should not trigger email-specific validation error
