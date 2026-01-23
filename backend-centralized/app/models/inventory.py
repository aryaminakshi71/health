"""
Inventory Models (Enhanced with Healthcare)
Models for inventory application including healthcare supplies
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime, date
import json

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    subcategory = Column(String(100))
    unit = Column(String(20))  # pieces, kg, liters, etc.
    unit_price = Column(Float)
    cost_price = Column(Float)
    selling_price = Column(Float)
    min_stock_level = Column(Integer, default=0)
    max_stock_level = Column(Integer)
    current_stock = Column(Integer, default=0)
    reorder_point = Column(Integer)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'))
    location = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="items")
    stock_movements = relationship("StockMovement", back_populates="item")
    purchase_orders = relationship("PurchaseOrderItem", back_populates="item")
    
    def get_stock_value(self) -> float:
        """Calculate total stock value"""
        return self.current_stock * self.cost_price if self.cost_price else 0.0
    
    def is_low_stock(self) -> bool:
        """Check if item is low on stock"""
        return self.current_stock <= self.min_stock_level
    
    def needs_reorder(self) -> bool:
        """Check if item needs reordering"""
        return self.current_stock <= self.reorder_point

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    tax_id = Column(String(50))
    payment_terms = Column(String(100))
    credit_limit = Column(Float)
    rating = Column(Float)  # 1-5 rating
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    items = relationship("Item", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    invoices = relationship("SupplierInvoice", back_populates="supplier")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    movement_type = Column(String(20), nullable=False)  # in, out, adjustment, transfer
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float)
    total_value = Column(Float)
    reference_number = Column(String(50))  # PO number, invoice number, etc.
    reference_type = Column(String(50))  # purchase_order, sale, adjustment, transfer
    location_from = Column(String(100))
    location_to = Column(String(100))
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    item = relationship("Item", back_populates="stock_movements")
    created_by_user = relationship("User")
    
    def calculate_total_value(self) -> float:
        """Calculate total value of movement"""
        if self.unit_price:
            return self.quantity * self.unit_price
        return 0.0

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    order_date = Column(Date, nullable=False)
    expected_delivery = Column(Date)
    status = Column(String(20), default='draft')  # draft, sent, confirmed, received, cancelled
    total_amount = Column(Float)
    tax_amount = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    created_by_user = relationship("User")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey('purchase_orders.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    received_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    item = relationship("Item", back_populates="purchase_orders")
    
    def calculate_total_price(self) -> float:
        """Calculate total price for this item"""
        return self.quantity * self.unit_price

class SupplierInvoice(Base):
    __tablename__ = "supplier_invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    purchase_order_id = Column(Integer, ForeignKey('purchase_orders.id'))
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date)
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    status = Column(String(20), default='pending')  # pending, paid, overdue, cancelled
    paid_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="invoices")
    purchase_order = relationship("PurchaseOrder")

class InventoryCategory(Base):
    __tablename__ = "inventory_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    parent_category_id = Column(Integer, ForeignKey('inventory_categories.id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    parent_category = relationship("InventoryCategory", remote_side=[id])
    subcategories = relationship("InventoryCategory", overlaps="parent_category")

class InventoryLocation(Base):
    __tablename__ = "inventory_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    address = Column(Text)
    contact_person = Column(String(100))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    # Note: This relationship needs to be defined in the Item model

class InventoryAudit(Base):
    __tablename__ = "inventory_audits"
    
    id = Column(Integer, primary_key=True, index=True)
    audit_number = Column(String(50), unique=True, nullable=False)
    location_id = Column(Integer, ForeignKey('inventory_locations.id'))
    audit_date = Column(Date, nullable=False)
    status = Column(String(20), default='in_progress')  # in_progress, completed, cancelled
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    location = relationship("InventoryLocation")
    created_by_user = relationship("User")
    audit_items = relationship("InventoryAuditItem", back_populates="audit")

class InventoryAuditItem(Base):
    __tablename__ = "inventory_audit_items"
    
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey('inventory_audits.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    expected_quantity = Column(Integer, nullable=False)
    actual_quantity = Column(Integer)
    variance = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    audit = relationship("InventoryAudit", back_populates="audit_items")
    item = relationship("Item")
    
    def calculate_variance(self) -> int:
        """Calculate variance between expected and actual quantity"""
        if self.actual_quantity is not None:
            return self.actual_quantity - self.expected_quantity
        return 0

class InventoryTransfer(Base):
    __tablename__ = "inventory_transfers"
    
    id = Column(Integer, primary_key=True, index=True)
    transfer_number = Column(String(50), unique=True, nullable=False)
    from_location = Column(String(100), nullable=False)
    to_location = Column(String(100), nullable=False)
    transfer_date = Column(DateTime, nullable=False)
    status = Column(String(20), default='pending')  # pending, in_transit, completed, cancelled
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    created_by_user = relationship("User")
    transfer_items = relationship("InventoryTransferItem", back_populates="transfer")

class InventoryTransferItem(Base):
    __tablename__ = "inventory_transfer_items"
    
    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey('inventory_transfers.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    transfer = relationship("InventoryTransfer", back_populates="transfer_items")
    item = relationship("Item")

class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    alert_type = Column(String(50))  # low_stock, out_of_stock, overstock, expiry
    message = Column(Text, nullable=False)
    severity = Column(String(20))  # low, medium, high, critical
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    item = relationship("Item")
    resolved_by_user = relationship("User")

# Inventory constants
MOVEMENT_TYPES = [
    'in', 'out', 'adjustment', 'transfer', 'return'
]

PURCHASE_ORDER_STATUSES = [
    'draft', 'sent', 'confirmed', 'received', 'cancelled'
]

INVOICE_STATUSES = [
    'pending', 'paid', 'overdue', 'cancelled'
]

AUDIT_STATUSES = [
    'in_progress', 'completed', 'cancelled'
]

TRANSFER_STATUSES = [
    'pending', 'in_transit', 'completed', 'cancelled'
]

ALERT_SEVERITIES = [
    'low', 'medium', 'high', 'critical'
]
