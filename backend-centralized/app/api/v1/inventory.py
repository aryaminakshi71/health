"""
Inventory Tracker API
Complete CRUD operations for inventory management
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)

router = APIRouter()

# Mock inventory data
INVENTORY_ITEMS = [
    {
        "id": "I001",
        "name": "Laptop Chargers",
        "category": "Electronics",
        "sku": "LAP-CHRG-001",
        "quantity": 45,
        "min_quantity": 10,
        "max_quantity": 100,
        "unit_price": 25.99,
        "supplier": "TechSupplies Inc",
        "location": "Warehouse A",
        "status": "in_stock",
        "last_updated": "2024-01-25T10:30:00Z"
    },
    {
        "id": "I002",
        "name": "Wireless Mice",
        "category": "Electronics",
        "sku": "WIRE-MOUSE-002",
        "quantity": 23,
        "min_quantity": 15,
        "max_quantity": 50,
        "unit_price": 15.50,
        "supplier": "TechSupplies Inc",
        "location": "Warehouse A",
        "status": "low_stock",
        "last_updated": "2024-01-25T09:15:00Z"
    },
    {
        "id": "I003",
        "name": "Office Chairs",
        "category": "Furniture",
        "sku": "OFF-CHAIR-003",
        "quantity": 8,
        "min_quantity": 5,
        "max_quantity": 20,
        "unit_price": 199.99,
        "supplier": "OfficeFurniture Co",
        "location": "Warehouse B",
        "status": "low_stock",
        "last_updated": "2024-01-24T16:45:00Z"
    }
]

SUPPLIERS_DATA = [
    {
        "id": "S001",
        "name": "TechSupplies Inc",
        "email": "orders@techsupplies.com",
        "phone": "+1-555-0100",
        "address": "123 Tech Street, Silicon Valley, CA",
        "contact_person": "John Smith",
        "status": "active",
        "rating": 4.5,
        "total_orders": 150,
        "last_order": "2024-01-25"
    },
    {
        "id": "S002",
        "name": "OfficeFurniture Co",
        "email": "sales@officefurniture.com",
        "phone": "+1-555-0200",
        "address": "456 Office Ave, Business District, NY",
        "contact_person": "Sarah Johnson",
        "status": "active",
        "rating": 4.2,
        "total_orders": 75,
        "last_order": "2024-01-24"
    }
]

STOCK_MOVEMENTS = [
    {
        "id": "M001",
        "item_id": "I001",
        "type": "in",
        "quantity": 20,
        "reason": "restock",
        "date": "2024-01-25T10:30:00Z",
        "user": "admin",
        "notes": "Regular restock order"
    },
    {
        "id": "M002",
        "item_id": "I002",
        "type": "out",
        "quantity": 5,
        "reason": "sale",
        "date": "2024-01-25T09:15:00Z",
        "user": "sales_team",
        "notes": "Customer order #12345"
    }
]

@router.get("/dashboard")
async def get_inventory_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get Inventory dashboard with comprehensive metrics"""
    
    total_items = len(INVENTORY_ITEMS)
    low_stock_items = [item for item in INVENTORY_ITEMS if item["quantity"] <= item["min_quantity"]]
    out_of_stock_items = [item for item in INVENTORY_ITEMS if item["quantity"] == 0]
    total_value = sum(item["quantity"] * item["unit_price"] for item in INVENTORY_ITEMS)
    
    dashboard_data = {
        "metrics": {
            "total_items": total_items,
            "low_stock_items": len(low_stock_items),
            "out_of_stock_items": len(out_of_stock_items),
            "total_value": round(total_value, 2),
            "total_suppliers": len(SUPPLIERS_DATA),
            "recent_movements": len(STOCK_MOVEMENTS)
        },
        "alerts": {
            "low_stock": low_stock_items,
            "out_of_stock": out_of_stock_items
        },
        "recent_activity": STOCK_MOVEMENTS[:5],
        "top_items": sorted(INVENTORY_ITEMS, key=lambda x: x["quantity"], reverse=True)[:5]
    }
    
    return dashboard_data

# ==================== ITEMS CRUD OPERATIONS ====================

@router.get("/items")
async def get_inventory_items(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all inventory items"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="inventory_items",
        details={"operation": "list_items"},
        ip_address=request.client.host
    )
    
    return {"items": INVENTORY_ITEMS}

@router.get("/items/{item_id}")
async def get_inventory_item(
    item_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific inventory item"""
    
    item = next((i for i in INVENTORY_ITEMS if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="inventory_item",
        details={"item_id": item_id},
        ip_address=request.client.host
    )
    
    return {"item": item}

@router.post("/items")
async def create_inventory_item(
    item_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new inventory item"""
    
    # Validate required fields
    required_fields = ["name", "category", "sku", "quantity", "unit_price", "supplier"]
    for field in required_fields:
        if field not in item_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Check if SKU already exists
    if any(item["sku"] == item_data["sku"] for item in INVENTORY_ITEMS):
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Generate unique item ID
    item_id = f"I{str(uuid.uuid4())[:8].upper()}"
    
    new_item = {
        "id": item_id,
        "name": item_data["name"],
        "category": item_data["category"],
        "sku": item_data["sku"],
        "quantity": item_data["quantity"],
        "min_quantity": item_data.get("min_quantity", 0),
        "max_quantity": item_data.get("max_quantity", 1000),
        "unit_price": item_data["unit_price"],
        "supplier": item_data["supplier"],
        "location": item_data.get("location", "Default"),
        "status": "in_stock" if item_data["quantity"] > 0 else "out_of_stock",
        "last_updated": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "created_by": current_user
    }
    
    INVENTORY_ITEMS.append(new_item)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="inventory_item",
        details={"item_id": item_id, "item_name": item_data["name"]},
        ip_address=request.client.host
    )
    
    return {"item": new_item, "message": "Inventory item created successfully"}

@router.put("/items/{item_id}")
async def update_inventory_item(
    item_id: str,
    item_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update inventory item"""
    
    item_index = next((i for i, item in enumerate(INVENTORY_ITEMS) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update item data
    for key, value in item_data.items():
        if key in INVENTORY_ITEMS[item_index]:
            INVENTORY_ITEMS[item_index][key] = value
    
    # Update status based on quantity
    quantity = INVENTORY_ITEMS[item_index]["quantity"]
    min_quantity = INVENTORY_ITEMS[item_index]["min_quantity"]
    
    if quantity == 0:
        INVENTORY_ITEMS[item_index]["status"] = "out_of_stock"
    elif quantity <= min_quantity:
        INVENTORY_ITEMS[item_index]["status"] = "low_stock"
    else:
        INVENTORY_ITEMS[item_index]["status"] = "in_stock"
    
    INVENTORY_ITEMS[item_index]["last_updated"] = datetime.now().isoformat()
    INVENTORY_ITEMS[item_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="inventory_item",
        details={"item_id": item_id},
        ip_address=request.client.host
    )
    
    return {"item": INVENTORY_ITEMS[item_index], "message": "Inventory item updated successfully"}

@router.delete("/items/{item_id}")
async def delete_inventory_item(
    item_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete inventory item"""
    
    item_index = next((i for i, item in enumerate(INVENTORY_ITEMS) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    deleted_item = INVENTORY_ITEMS.pop(item_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="inventory_item",
        details={"item_id": item_id, "item_name": deleted_item["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Inventory item deleted successfully", "deleted_item": deleted_item}

# ==================== SUPPLIERS CRUD OPERATIONS ====================

@router.get("/suppliers")
async def get_suppliers(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all suppliers"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="suppliers",
        details={"operation": "list_suppliers"},
        ip_address=request.client.host
    )
    
    return {"suppliers": SUPPLIERS_DATA}

@router.get("/suppliers/{supplier_id}")
async def get_supplier(
    supplier_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific supplier"""
    
    supplier = next((s for s in SUPPLIERS_DATA if s["id"] == supplier_id), None)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="supplier",
        details={"supplier_id": supplier_id},
        ip_address=request.client.host
    )
    
    return {"supplier": supplier}

@router.post("/suppliers")
async def create_supplier(
    supplier_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new supplier"""
    
    # Validate required fields
    required_fields = ["name", "email", "phone"]
    for field in required_fields:
        if field not in supplier_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique supplier ID
    supplier_id = f"S{str(uuid.uuid4())[:8].upper()}"
    
    new_supplier = {
        "id": supplier_id,
        "name": supplier_data["name"],
        "email": supplier_data["email"],
        "phone": supplier_data["phone"],
        "address": supplier_data.get("address", ""),
        "contact_person": supplier_data.get("contact_person", ""),
        "status": supplier_data.get("status", "active"),
        "rating": supplier_data.get("rating", 0.0),
        "total_orders": 0,
        "last_order": None,
        "created_at": datetime.now().isoformat(),
        "created_by": current_user
    }
    
    SUPPLIERS_DATA.append(new_supplier)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="supplier",
        details={"supplier_id": supplier_id, "supplier_name": supplier_data["name"]},
        ip_address=request.client.host
    )
    
    return {"supplier": new_supplier, "message": "Supplier created successfully"}

@router.put("/suppliers/{supplier_id}")
async def update_supplier(
    supplier_id: str,
    supplier_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update supplier"""
    
    supplier_index = next((i for i, s in enumerate(SUPPLIERS_DATA) if s["id"] == supplier_id), None)
    if supplier_index is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Update supplier data
    for key, value in supplier_data.items():
        if key in SUPPLIERS_DATA[supplier_index]:
            SUPPLIERS_DATA[supplier_index][key] = value
    
    SUPPLIERS_DATA[supplier_index]["updated_at"] = datetime.now().isoformat()
    SUPPLIERS_DATA[supplier_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="supplier",
        details={"supplier_id": supplier_id},
        ip_address=request.client.host
    )
    
    return {"supplier": SUPPLIERS_DATA[supplier_index], "message": "Supplier updated successfully"}

@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(
    supplier_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete supplier"""
    
    supplier_index = next((i for i, s in enumerate(SUPPLIERS_DATA) if s["id"] == supplier_id), None)
    if supplier_index is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    deleted_supplier = SUPPLIERS_DATA.pop(supplier_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="supplier",
        details={"supplier_id": supplier_id, "supplier_name": deleted_supplier["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Supplier deleted successfully", "deleted_supplier": deleted_supplier}

# ==================== STOCK MOVEMENTS CRUD OPERATIONS ====================

@router.get("/movements")
async def get_stock_movements(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all stock movements"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="stock_movements",
        details={"operation": "list_movements"},
        ip_address=request.client.host
    )
    
    return {"movements": STOCK_MOVEMENTS}

@router.get("/movements/{movement_id}")
async def get_stock_movement(
    movement_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific stock movement"""
    
    movement = next((m for m in STOCK_MOVEMENTS if m["id"] == movement_id), None)
    if not movement:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="stock_movement",
        details={"movement_id": movement_id},
        ip_address=request.client.host
    )
    
    return {"movement": movement}

@router.post("/movements")
async def create_stock_movement(
    movement_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new stock movement"""
    
    # Validate required fields
    required_fields = ["item_id", "type", "quantity", "reason"]
    for field in required_fields:
        if field not in movement_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Validate item exists
    item = next((i for i in INVENTORY_ITEMS if i["id"] == movement_data["item_id"]), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Generate unique movement ID
    movement_id = f"M{str(uuid.uuid4())[:8].upper()}"
    
    new_movement = {
        "id": movement_id,
        "item_id": movement_data["item_id"],
        "type": movement_data["type"],  # "in" or "out"
        "quantity": movement_data["quantity"],
        "reason": movement_data["reason"],
        "date": datetime.now().isoformat(),
        "user": current_user,
        "notes": movement_data.get("notes", "")
    }
    
    STOCK_MOVEMENTS.append(new_movement)
    
    # Update item quantity
    item_index = next((i for i, item in enumerate(INVENTORY_ITEMS) if item["id"] == movement_data["item_id"]), None)
    if item_index is not None:
        if movement_data["type"] == "in":
            INVENTORY_ITEMS[item_index]["quantity"] += movement_data["quantity"]
        else:
            INVENTORY_ITEMS[item_index]["quantity"] -= movement_data["quantity"]
        
        # Update status
        quantity = INVENTORY_ITEMS[item_index]["quantity"]
        min_quantity = INVENTORY_ITEMS[item_index]["min_quantity"]
        
        if quantity == 0:
            INVENTORY_ITEMS[item_index]["status"] = "out_of_stock"
        elif quantity <= min_quantity:
            INVENTORY_ITEMS[item_index]["status"] = "low_stock"
        else:
            INVENTORY_ITEMS[item_index]["status"] = "in_stock"
        
        INVENTORY_ITEMS[item_index]["last_updated"] = datetime.now().isoformat()
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="stock_movement",
        details={"movement_id": movement_id, "item_id": movement_data["item_id"]},
        ip_address=request.client.host
    )
    
    return {"movement": new_movement, "message": "Stock movement created successfully"}

# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics/stock")
async def get_stock_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get stock analytics"""
    
    total_items = len(INVENTORY_ITEMS)
    low_stock_items = [item for item in INVENTORY_ITEMS if item["quantity"] <= item["min_quantity"]]
    out_of_stock_items = [item for item in INVENTORY_ITEMS if item["quantity"] == 0]
    total_value = sum(item["quantity"] * item["unit_price"] for item in INVENTORY_ITEMS)
    
    analytics_data = {
        "total_items": total_items,
        "low_stock_count": len(low_stock_items),
        "out_of_stock_count": len(out_of_stock_items),
        "total_value": round(total_value, 2),
        "average_value_per_item": round(total_value / total_items if total_items > 0 else 0, 2),
        "stock_alerts": {
            "low_stock": low_stock_items,
            "out_of_stock": out_of_stock_items
        },
        "category_distribution": {},
        "top_items_by_value": sorted(INVENTORY_ITEMS, key=lambda x: x["quantity"] * x["unit_price"], reverse=True)[:10]
    }
    
    # Calculate category distribution
    for item in INVENTORY_ITEMS:
        category = item["category"]
        if category not in analytics_data["category_distribution"]:
            analytics_data["category_distribution"][category] = 0
        analytics_data["category_distribution"][category] += 1
    
    return analytics_data

@router.get("/alerts/low-stock")
async def get_low_stock_alerts(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get low stock alerts"""
    
    low_stock_items = [item for item in INVENTORY_ITEMS if item["quantity"] <= item["min_quantity"]]
    out_of_stock_items = [item for item in INVENTORY_ITEMS if item["quantity"] == 0]
    
    alerts = {
        "low_stock": low_stock_items,
        "out_of_stock": out_of_stock_items,
        "total_alerts": len(low_stock_items) + len(out_of_stock_items),
        "timestamp": datetime.now().isoformat()
    }
    
    return alerts

@router.get("/reports/stock-movement")
async def get_stock_movement_report(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get stock movement report"""
    
    # Group movements by item
    movements_by_item = {}
    for movement in STOCK_MOVEMENTS:
        item_id = movement["item_id"]
        if item_id not in movements_by_item:
            movements_by_item[item_id] = []
        movements_by_item[item_id].append(movement)
    
    report_data = {
        "total_movements": len(STOCK_MOVEMENTS),
        "movements_by_item": movements_by_item,
        "recent_movements": sorted(STOCK_MOVEMENTS, key=lambda x: x["date"], reverse=True)[:20],
        "movement_summary": {
            "in_movements": len([m for m in STOCK_MOVEMENTS if m["type"] == "in"]),
            "out_movements": len([m for m in STOCK_MOVEMENTS if m["type"] == "out"])
        }
    }
    
    return report_data 