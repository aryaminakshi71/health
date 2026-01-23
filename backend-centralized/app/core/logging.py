"""
Logging configuration for the application
"""

import logging
import sys
from datetime import datetime
from typing import Optional

# Configure logging
def setup_logging(level: str = "INFO", log_file: Optional[str] = None):
    """Setup logging configuration"""
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Create handlers
    handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    handlers.append(console_handler)
    
    # File handler (if specified)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        handlers=handlers,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

# Create audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# Create application logger
app_logger = logging.getLogger("app")
app_logger.setLevel(logging.INFO)

# Create security logger
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.WARNING)

# Create database logger
db_logger = logging.getLogger("database")
db_logger.setLevel(logging.INFO)

# Create API logger
api_logger = logging.getLogger("api")
api_logger.setLevel(logging.INFO)

# Create websocket logger
websocket_logger = logging.getLogger("websocket")
websocket_logger.setLevel(logging.INFO)

# Create monitoring logger
monitoring_logger = logging.getLogger("monitoring")
monitoring_logger.setLevel(logging.INFO)

# Create billing logger
billing_logger = logging.getLogger("billing")
billing_logger.setLevel(logging.INFO)

# Create client management logger
client_logger = logging.getLogger("client_management")
client_logger.setLevel(logging.INFO)

# Logging utilities
def log_user_activity(user_id: str, action: str, details: dict = None, ip_address: str = None):
    """Log user activity"""
    log_data = {
        "user_id": user_id,
        "action": action,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
        "ip_address": ip_address
    }
    audit_logger.info(f"User Activity: {log_data}")

def log_security_event(event_type: str, details: dict = None, severity: str = "INFO"):
    """Log security events"""
    log_data = {
        "event_type": event_type,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
        "severity": severity
    }
    security_logger.warning(f"Security Event: {log_data}")

def log_api_request(method: str, path: str, status_code: int, user_id: str = None, duration: float = None):
    """Log API requests"""
    log_data = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "user_id": user_id,
        "duration": duration,
        "timestamp": datetime.now().isoformat()
    }
    api_logger.info(f"API Request: {log_data}")

def log_database_operation(operation: str, table: str, details: dict = None):
    """Log database operations"""
    log_data = {
        "operation": operation,
        "table": table,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    db_logger.info(f"Database Operation: {log_data}")

def log_billing_event(event_type: str, client_id: str, amount: float = None, details: dict = None):
    """Log billing events"""
    log_data = {
        "event_type": event_type,
        "client_id": client_id,
        "amount": amount,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    billing_logger.info(f"Billing Event: {log_data}")

def log_client_management_event(event_type: str, client_id: str, details: dict = None):
    """Log client management events"""
    log_data = {
        "event_type": event_type,
        "client_id": client_id,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    client_logger.info(f"Client Management Event: {log_data}")

# Initialize logging
setup_logging()
