"""
Centralized Database Configuration
Single database for all applications
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from typing import Generator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5432/erp_system"
)

# Production database pool settings
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # 30 minutes

# For development, use SQLite if PostgreSQL is not available
if DATABASE_URL.startswith("postgresql://"):
    try:
        from sqlalchemy import text

        # Test PostgreSQL connection with proper connection pooling
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=POOL_RECYCLE,
            pool_size=POOL_SIZE,
            max_overflow=MAX_OVERFLOW,
            pool_timeout=POOL_TIMEOUT,
            echo=os.getenv("DB_ECHO", "false").lower() == "true",
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(
            f"PostgreSQL connection established (pool_size={POOL_SIZE}, max_overflow={MAX_OVERFLOW})"
        )
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed: {e}")
        if os.getenv("NODE_ENV") == "production":
            logger.error("FATAL: Database connection required in production")
            raise
        logger.info("Falling back to SQLite for development")
        DATABASE_URL = "sqlite:///./erp_system.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
else:
    # Use SQLite for development
    DATABASE_URL = "sqlite:///./erp_system.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Metadata for database operations
metadata = MetaData()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database with all tables
    """
    try:
        # Import all models to ensure they are registered
        from app.models.user import User
        from app.models.healthcare import Patient, MedicalRecord, Appointment
        from app.models.ai_analytics import MLModel, Prediction, DataSource
        from app.models.communication import Call, Message, Contact
        from app.models.business import Project, Client, Revenue
        from app.models.inventory import Item, Supplier, StockMovement
        from app.models.financial import Transaction, Account, Budget

        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


def create_tables():
    """
    Create all database tables
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ All database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Table creation failed: {e}")
        raise


def drop_tables():
    """
    Drop all database tables (use with caution!)
    """
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("✅ All database tables dropped successfully")
    except Exception as e:
        logger.error(f"❌ Table dropping failed: {e}")
        raise


# Database health check
def check_db_health() -> bool:
    """
    Check if database is healthy and accessible
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# Database statistics
def get_db_stats():
    """
    Get database statistics
    """
    try:
        with engine.connect() as conn:
            # Get table counts
            tables = [
                "users",
                "patients",
                "medical_records",
                "appointments",
                "ml_models",
                "predictions",
                "data_sources",
                "calls",
                "messages",
                "contacts",
                "projects",
                "clients",
                "revenues",
                "items",
                "suppliers",
                "stock_movements",
                "transactions",
                "accounts",
                "budgets",
                "autism_patients",
                "therapy_sessions",
                "sensory_activities",
                "students",
                "courses",
                "assignments",
                "files",
                "folders",
                "backup_jobs",
                "cameras",
                "alerts",
                "recordings",
                "employees",
                "recruitments",
                "performances",
                "compliance_rules",
                "audits",
                "risk_assessments",
            ]

            stats = {}
            for table in tables:
                try:
                    result = conn.execute(f"SELECT COUNT(*) FROM {table}")
                    count = result.scalar()
                    stats[table] = count
                except:
                    stats[table] = 0

            return stats
    except Exception as e:
        logger.error(f"Failed to get database stats: {e}")
        return {}


# Database backup function
def backup_database(backup_path: str = None):
    """
    Create database backup
    """
    if not backup_path:
        backup_path = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"

    try:
        if DATABASE_URL.startswith("postgresql://"):
            # PostgreSQL backup
            import subprocess

            subprocess.run(
                [
                    "pg_dump",
                    "-h",
                    "localhost",
                    "-U",
                    "postgres",
                    "-d",
                    "erp_system",
                    "-f",
                    backup_path,
                ]
            )
        else:
            # SQLite backup
            import shutil

            shutil.copy2("erp_system.db", backup_path)

        logger.info(f"✅ Database backup created: {backup_path}")
        return backup_path
    except Exception as e:
        logger.error(f"❌ Database backup failed: {e}")
        raise


# Database restore function
def restore_database(backup_path: str):
    """
    Restore database from backup
    """
    try:
        if DATABASE_URL.startswith("postgresql://"):
            # PostgreSQL restore
            import subprocess

            subprocess.run(
                [
                    "psql",
                    "-h",
                    "localhost",
                    "-U",
                    "postgres",
                    "-d",
                    "erp_system",
                    "-f",
                    backup_path,
                ]
            )
        else:
            # SQLite restore
            import shutil

            shutil.copy2(backup_path, "erp_system.db")

        logger.info(f"✅ Database restored from: {backup_path}")
    except Exception as e:
        logger.error(f"❌ Database restore failed: {e}")
        raise


# Import datetime for backup function
from datetime import datetime
