"""
CRUD Operations Template
Standard template for implementing complete CRUD operations
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from ...core.security import (
    security_manager,
    get_current_user,
    get_current_user_dev_optional
)

def create_crud_router(resource_name: str, data_store: List[Dict], required_fields: List[str] = None):
    """
    Create a CRUD router for any resource
    
    Args:
        resource_name: Name of the resource (e.g., 'projects', 'clients')
        data_store: List to store the data
        required_fields: List of required fields for creation
    """
    
    router = APIRouter()
    resource_id_key = f"{resource_name[:-1]}_id"  # Remove 's' and add '_id'
    
    @router.get(f"/{resource_name}")
    async def get_resources(
        request: Request,
        current_user: str = Depends(get_current_user_dev_optional)
    ):
        """Get all resources"""
        
        # Log audit event
        security_manager.log_audit_event(
            user_id=current_user,
            action="read",
            resource=resource_name,
            details={"operation": f"get_{resource_name}"},
            ip_address=request.client.host
        )
        
        return {resource_name: data_store}
    
    @router.get(f"/{resource_name}/{{resource_id}}")
    async def get_resource(
        resource_id: str,
        request: Request,
        current_user: str = Depends(get_current_user_dev_optional)
    ):
        """Get specific resource by ID"""
        
        resource = next((r for r in data_store if r["id"] == resource_id), None)
        if not resource:
            raise HTTPException(status_code=404, detail=f"{resource_name[:-1].title()} not found")
        
        # Log audit event
        security_manager.log_audit_event(
            user_id=current_user,
            action="read",
            resource=resource_name[:-1],
            details={resource_id_key: resource_id},
            ip_address=request.client.host
        )
        
        return {resource_name[:-1]: resource}
    
    @router.post(f"/{resource_name}")
    async def create_resource(
        resource_data: Dict[str, Any],
        request: Request,
        current_user: str = Depends(get_current_user)
    ):
        """Create new resource"""
        
        # Validate required fields
        if required_fields:
            for field in required_fields:
                if field not in resource_data:
                    raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Generate unique ID
        resource_id = f"{resource_name[:-1][:1].upper()}{str(uuid.uuid4())[:8].upper()}"
        
        new_resource = {
            "id": resource_id,
            **resource_data,
            "created_at": datetime.now().isoformat(),
            "created_by": current_user
        }
        
        data_store.append(new_resource)
        
        # Log audit event
        security_manager.log_audit_event(
            user_id=current_user,
            action="create",
            resource=resource_name[:-1],
            details={resource_id_key: resource_id},
            ip_address=request.client.host
        )
        
        return {resource_name[:-1]: new_resource, "message": f"{resource_name[:-1].title()} created successfully"}
    
    @router.put(f"/{resource_name}/{{resource_id}}")
    async def update_resource(
        resource_id: str,
        resource_data: Dict[str, Any],
        request: Request,
        current_user: str = Depends(get_current_user)
    ):
        """Update existing resource"""
        
        resource_index = next((i for i, r in enumerate(data_store) if r["id"] == resource_id), None)
        if resource_index is None:
            raise HTTPException(status_code=404, detail=f"{resource_name[:-1].title()} not found")
        
        # Update resource data
        for key, value in resource_data.items():
            if key in data_store[resource_index]:
                data_store[resource_index][key] = value
        
        data_store[resource_index]["updated_at"] = datetime.now().isoformat()
        data_store[resource_index]["updated_by"] = current_user
        
        # Log audit event
        security_manager.log_audit_event(
            user_id=current_user,
            action="update",
            resource=resource_name[:-1],
            details={resource_id_key: resource_id},
            ip_address=request.client.host
        )
        
        return {resource_name[:-1]: data_store[resource_index], "message": f"{resource_name[:-1].title()} updated successfully"}
    
    @router.delete(f"/{resource_name}/{{resource_id}}")
    async def delete_resource(
        resource_id: str,
        request: Request,
        current_user: str = Depends(get_current_user)
    ):
        """Delete resource"""
        
        resource_index = next((i for i, r in enumerate(data_store) if r["id"] == resource_id), None)
        if resource_index is None:
            raise HTTPException(status_code=404, detail=f"{resource_name[:-1].title()} not found")
        
        deleted_resource = data_store.pop(resource_index)
        
        # Log audit event
        security_manager.log_audit_event(
            user_id=current_user,
            action="delete",
            resource=resource_name[:-1],
            details={resource_id_key: resource_id},
            ip_address=request.client.host
        )
        
        return {"message": f"{resource_name[:-1].title()} deleted successfully", f"deleted_{resource_name[:-1]}": deleted_resource}
    
    return router 