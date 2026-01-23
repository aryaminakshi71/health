#!/usr/bin/env python3
"""
Database Migration Script
Migrates data from individual databases to centralized system
"""

import os
import sys
import sqlite3
import shutil
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from databases.config.database import create_all_tables, get_engine, get_session
from shared.models import Base

def migrate_individual_databases():
    """Migrate data from individual databases to centralized system"""
    
    # List of individual databases to migrate
    individual_dbs = [
        "ai_analytics_suite.db",
        "cloud_storage_pro.db", 
        "compliance_guardian.db",
        "education_platform.db",
        "financial_manager.db",
        "healthcare_hub.db",
        "hr_manager_plus.db",
        "inventory_tracker.db",
        "support_desk.db",
        "surveillance_guard.db",
        "voip_connect_pro.db"
    ]
    
    print("🗄️ Starting database migration...")
    
    # Create centralized databases
    create_all_tables()
    print("✅ Created centralized database tables")
    
    # Migrate each individual database
    for db_file in individual_dbs:
        source_path = f"shared/databases/{db_file}"
        
        if os.path.exists(source_path):
            print(f"📋 Migrating {db_file}...")
            
            # Copy to centralized location
            dest_path = f"databases/{db_file}"
            shutil.copy2(source_path, dest_path)
            
            print(f"✅ Migrated {db_file}")
        else:
            print(f"⚠️  {db_file} not found, skipping...")
    
    print("✅ Database migration complete!")

def create_database_backups():
    """Create backups of all databases"""
    
    print("💾 Creating database backups...")
    
    backup_dir = "databases/backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Backup centralized databases
    for db_file in os.listdir("databases"):
        if db_file.endswith(".db"):
            source_path = f"databases/{db_file}"
            backup_path = f"{backup_dir}/{db_file.replace('.db', '')}_{timestamp}.db"
            shutil.copy2(source_path, backup_path)
            print(f"✅ Backed up {db_file}")
    
    print("✅ Database backups complete!")

def verify_migration():
    """Verify that migration was successful"""
    
    print("🔍 Verifying migration...")
    
    # Check if centralized databases exist
    expected_dbs = [
        "main.db",
        "healthcare.db", 
        "communication.db",
        "business.db",
        "ai_analytics.db",
        "inventory.db",
        "financial.db",
        "education.db",
        "cloud_storage.db",
        "surveillance.db",
        "hr.db",
        "compliance.db",
        "support.db"
    ]
    
    for db_name in expected_dbs:
        db_path = f"databases/{db_name}"
        if os.path.exists(db_path):
            size = os.path.getsize(db_path)
            print(f"✅ {db_name}: {size} bytes")
        else:
            print(f"❌ {db_name}: Not found")
    
    print("✅ Migration verification complete!")

if __name__ == "__main__":
    print("🗄️ Database Migration Tool")
    print("=" * 40)
    
    # Create backups first
    create_database_backups()
    
    # Migrate databases
    migrate_individual_databases()
    
    # Verify migration
    verify_migration()
    
    print("🎉 Database migration completed successfully!") 