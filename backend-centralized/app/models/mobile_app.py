"""
Mobile App Builder Database Models
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class MobileApp(Base):
    __tablename__ = "mobile_apps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    bundle_id = Column(String(255), unique=True)
    platform = Column(String(20), nullable=False)  # ios, android, cross-platform
    category = Column(String(100), nullable=False)
    description = Column(Text)
    icon_url = Column(String(500))
    version = Column(String(20), default="1.0.0")
    status = Column(String(20), default="development")  # development, testing, published, archived
    settings = Column(JSON)  # App settings and configuration
    analytics = Column(JSON)  # Analytics data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    screens = relationship("MobileAppScreen", back_populates="app")
    builds = relationship("MobileAppBuild", back_populates="app")
    analytics_data = relationship("MobileAppAnalytics", back_populates="app")

class MobileAppScreen(Base):
    __tablename__ = "mobile_app_screens"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("mobile_apps.id"), nullable=False)
    name = Column(String(255), nullable=False)
    screen_type = Column(String(50), nullable=False)  # home, login, profile, settings, etc.
    layout = Column(JSON, nullable=False)  # Screen layout and components
    navigation = Column(JSON)  # Navigation configuration
    styles = Column(JSON)  # Screen-specific styles
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    app = relationship("MobileApp", back_populates="screens")

class MobileAppComponent(Base):
    __tablename__ = "mobile_app_components"
    
    id = Column(Integer, primary_key=True, index=True)
    screen_id = Column(Integer, ForeignKey("mobile_app_screens.id"), nullable=False)
    component_type = Column(String(100), nullable=False)  # button, text, image, form, etc.
    component_data = Column(JSON, nullable=False)  # Component content and settings
    position = Column(JSON)  # x, y, width, height
    styles = Column(JSON)  # Component styles
    responsive_settings = Column(JSON)  # Platform-specific settings
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    screen = relationship("MobileAppScreen")

class MobileAppTemplate(Base):
    __tablename__ = "mobile_app_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # healthcare, ecommerce, social, productivity
    platform = Column(String(20), nullable=False)  # ios, android, cross-platform
    description = Column(Text)
    preview_image = Column(String(500))
    template_data = Column(JSON, nullable=False)  # Template structure and screens
    features = Column(JSON)  # List of features included
    is_free = Column(Boolean, default=True)
    price = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MobileAppBuild(Base):
    __tablename__ = "mobile_app_builds"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("mobile_apps.id"), nullable=False)
    version = Column(String(20), nullable=False)
    build_number = Column(Integer, nullable=False)
    platform = Column(String(20), nullable=False)  # ios, android
    build_type = Column(String(20), nullable=False)  # debug, release
    status = Column(String(20), default="building")  # building, success, failed
    build_url = Column(String(500))  # Download URL
    file_size = Column(Integer)  # Size in bytes
    release_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    app = relationship("MobileApp", back_populates="builds")

class MobileAppAnalytics(Base):
    __tablename__ = "mobile_app_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("mobile_apps.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    active_users = Column(Integer, default=0)
    daily_active_users = Column(Integer, default=0)
    monthly_active_users = Column(Integer, default=0)
    session_duration = Column(Float, default=0.0)
    crash_rate = Column(Float, default=0.0)
    retention_rate = Column(Float, default=0.0)
    user_engagement = Column(Float, default=0.0)
    top_features = Column(JSON)
    user_segments = Column(JSON)
    performance_metrics = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    app = relationship("MobileApp", back_populates="analytics_data")

class MobileAppPublishing(Base):
    __tablename__ = "mobile_app_publishing"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("mobile_apps.id"), nullable=False)
    platform = Column(String(20), nullable=False)  # ios, android
    store_name = Column(String(100), nullable=False)  # App Store, Google Play
    store_url = Column(String(500))
    app_store_id = Column(String(255))
    status = Column(String(20), default="pending")  # pending, approved, rejected, published
    review_status = Column(String(20))  # pending, approved, rejected
    review_notes = Column(Text)
    published_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    app = relationship("MobileApp")

class MobileAppMonetization(Base):
    __tablename__ = "mobile_app_monetization"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("mobile_apps.id"), nullable=False)
    model = Column(String(20), nullable=False)  # free, freemium, paid, subscription, ads
    price = Column(Float, default=0.0)
    currency = Column(String(3), default="USD")
    subscription_plans = Column(JSON)
    ad_settings = Column(JSON)
    in_app_purchases = Column(JSON)
    revenue = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    app = relationship("MobileApp")

class MobileAppTesting(Base):
    __tablename__ = "mobile_app_testing"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("mobile_apps.id"), nullable=False)
    test_type = Column(String(50), nullable=False)  # unit, integration, ui, performance
    test_name = Column(String(255), nullable=False)
    test_data = Column(JSON)
    status = Column(String(20), default="pending")  # pending, running, passed, failed
    results = Column(JSON)
    execution_time = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    app = relationship("MobileApp") 