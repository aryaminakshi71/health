"""
Website Builder Database Models
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Website(Base):
    __tablename__ = "websites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True)
    template = Column(String(100), nullable=False)
    status = Column(String(20), default="draft")  # draft, published, archived
    description = Column(Text)
    settings = Column(JSON)  # Theme, branding, domain settings
    analytics = Column(JSON)  # Analytics data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    pages = relationship("WebsitePage", back_populates="website")
    custom_domains = relationship("WebsiteCustomDomain", back_populates="website")

class WebsitePage(Base):
    __tablename__ = "website_pages"
    
    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    page_type = Column(String(50), nullable=False)  # home, about, contact, blog, etc.
    content = Column(JSON)  # Page components and layout
    seo_settings = Column(JSON)  # SEO metadata
    status = Column(String(20), default="draft")  # draft, published
    is_homepage = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    website = relationship("Website", back_populates="pages")

class WebsiteComponent(Base):
    __tablename__ = "website_components"
    
    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("website_pages.id"), nullable=False)
    component_type = Column(String(100), nullable=False)  # text, image, video, form, etc.
    component_data = Column(JSON, nullable=False)  # Component content and settings
    position = Column(JSON)  # x, y, width, height, z-index
    styles = Column(JSON)  # CSS styles
    responsive_settings = Column(JSON)  # Mobile, tablet, desktop settings
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    page = relationship("WebsitePage")

class WebsiteTemplate(Base):
    __tablename__ = "website_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # business, ecommerce, portfolio, blog
    description = Column(Text)
    preview_image = Column(String(500))
    template_data = Column(JSON, nullable=False)  # Template structure and components
    features = Column(JSON)  # List of features included
    is_free = Column(Boolean, default=True)
    price = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class WebsiteCustomDomain(Base):
    __tablename__ = "website_custom_domains"
    
    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    domain = Column(String(255), nullable=False, unique=True)
    ssl_enabled = Column(Boolean, default=True)
    dns_records = Column(JSON)  # DNS configuration
    status = Column(String(20), default="pending")  # pending, active, failed
    verified_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    website = relationship("Website", back_populates="custom_domains")

class WebsiteAnalytics(Base):
    __tablename__ = "website_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    visitors = Column(Integer, default=0)
    page_views = Column(Integer, default=0)
    bounce_rate = Column(Float, default=0.0)
    avg_session_duration = Column(Float, default=0.0)
    conversion_rate = Column(Float, default=0.0)
    top_pages = Column(JSON)
    traffic_sources = Column(JSON)
    device_types = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    website = relationship("Website")

class WebsiteForm(Base):
    __tablename__ = "website_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    page_id = Column(Integer, ForeignKey("website_pages.id"), nullable=False)
    name = Column(String(255), nullable=False)
    form_type = Column(String(50), nullable=False)  # contact, newsletter, survey, etc.
    fields = Column(JSON, nullable=False)  # Form field configuration
    settings = Column(JSON)  # Form settings and validation
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    website = relationship("Website")
    page = relationship("WebsitePage")
    submissions = relationship("WebsiteFormSubmission", back_populates="form")

class WebsiteFormSubmission(Base):
    __tablename__ = "website_form_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("website_forms.id"), nullable=False)
    data = Column(JSON, nullable=False)  # Form submission data
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    form = relationship("WebsiteForm", back_populates="submissions")

class WebsiteHosting(Base):
    __tablename__ = "website_hosting"
    
    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    provider = Column(String(100), nullable=False)
    plan = Column(String(100), nullable=False)
    storage_gb = Column(Integer, default=1)
    bandwidth_gb = Column(Integer, default=10)
    ssl_enabled = Column(Boolean, default=True)
    cdn_enabled = Column(Boolean, default=False)
    backups_enabled = Column(Boolean, default=True)
    status = Column(String(20), default="active")  # active, suspended, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    website = relationship("Website") 