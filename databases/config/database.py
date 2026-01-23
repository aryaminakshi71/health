"""
Centralized Database Configuration
Manages all databases for the ERP Survey VoIP v2 system
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database URLs
DATABASE_URLS = {
    "main": "sqlite:///databases/main.db",
    "healthcare": "sqlite:///databases/healthcare.db",
    "communication": "sqlite:///databases/communication.db",
    "business": "sqlite:///databases/business.db",
    "ai_analytics": "sqlite:///databases/ai_analytics.db",
    "inventory": "sqlite:///databases/inventory.db",
    "financial": "sqlite:///databases/financial.db",
    "education": "sqlite:///databases/education.db",
    "cloud_storage": "sqlite:///databases/cloud_storage.db",
    "surveillance": "sqlite:///databases/surveillance.db",
    "hr": "sqlite:///databases/hr.db",
    "compliance": "sqlite:///databases/compliance.db",
    "support": "sqlite:///databases/support.db"
}

# Create engines for each database
engines: Dict[str, Any] = {}
sessions: Dict[str, Any] = {}

def get_engine(database_name: str):
    """Get database engine for specified database"""
    if database_name not in engines:
        if database_name not in DATABASE_URLS:
            raise ValueError(f"Unknown database: {database_name}")
        
        engine = create_engine(
            DATABASE_URLS[database_name],
            echo=False,
            pool_pre_ping=True
        )
        engines[database_name] = engine
        logger.info(f"Created engine for database: {database_name}")
    
    return engines[database_name]

def get_session(database_name: str):
    """Get database session for specified database"""
    if database_name not in sessions:
        engine = get_engine(database_name)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        sessions[database_name] = SessionLocal()
        logger.info(f"Created session for database: {database_name}")
    
    return sessions[database_name]

def close_all_sessions():
    """Close all database sessions"""
    for session in sessions.values():
        session.close()
    sessions.clear()
    logger.info("Closed all database sessions")

def create_all_tables():
    """Create all tables in all databases"""
    from shared.models import Base
    
    for database_name in DATABASE_URLS.keys():
        engine = get_engine(database_name)
        Base.metadata.create_all(bind=engine)
        logger.info(f"Created tables for database: {database_name}")

def drop_all_tables():
    """Drop all tables in all databases"""
    from shared.models import Base
    
    for database_name in DATABASE_URLS.keys():
        engine = get_engine(database_name)
        Base.metadata.drop_all(bind=engine)
        logger.info(f"Dropped tables for database: {database_name}")

# Base class for all models
Base = declarative_base()

# Database context manager
class DatabaseManager:
    def __init__(self, database_name: str):
        self.database_name = database_name
        self.session = None
    
    def __enter__(self):
        self.session = get_session(self.database_name)
        return self.session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            self.session.close()

# Utility functions
def get_database_session(database_name: str):
    """Get database session with context manager"""
    return DatabaseManager(database_name)

def execute_query(database_name: str, query: str, params: dict = None):
    """Execute raw SQL query on specified database"""
    with get_database_session(database_name) as session:
        result = session.execute(query, params or {})
        return result

def backup_database(database_name: str):
    """Create backup of specified database"""
    import shutil
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"databases/backups/{database_name}_{timestamp}.db"
    
    if database_name in DATABASE_URLS:
        db_path = DATABASE_URLS[database_name].replace("sqlite:///", "")
        if os.path.exists(db_path):
            shutil.copy2(db_path, backup_path)
            logger.info(f"Created backup: {backup_path}")
            return backup_path
    
    return None

def restore_database(database_name: str, backup_path: str):
    """Restore database from backup"""
    import shutil
    
    if database_name in DATABASE_URLS:
        db_path = DATABASE_URLS[database_name].replace("sqlite:///", "")
        shutil.copy2(backup_path, db_path)
        logger.info(f"Restored database {database_name} from {backup_path}")

def get_database_info(database_name: str):
    """Get information about specified database"""
    if database_name not in DATABASE_URLS:
        return None
    
    db_path = DATABASE_URLS[database_name].replace("sqlite:///", "")
    
    if os.path.exists(db_path):
        size = os.path.getsize(db_path)
        return {
            "name": database_name,
            "path": db_path,
            "size_bytes": size,
            "size_mb": round(size / (1024 * 1024), 2)
        }
    
    return None

def list_all_databases():
    """List all databases with their information"""
    databases = []
    for db_name in DATABASE_URLS.keys():
        info = get_database_info(db_name)
        if info:
            databases.append(info)
    return databases 