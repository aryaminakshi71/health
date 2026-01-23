"""
Client Management Service
Handles business logic for client operations
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app.models.client_management import (
    Client, ClientUsage, ClientBilling, ClientUser, ClientSettings, ClientActivity,
    SubscriptionTier, ClientStatus, BillingCycle
)
import logging
audit_logger = logging.getLogger(__name__)

class ClientManagementService:
    """Service for client management operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_subscription_pricing(self, tier: SubscriptionTier) -> float:
        """Get monthly pricing for subscription tier"""
        pricing = {
            SubscriptionTier.BASIC: 29.0,
            SubscriptionTier.PROFESSIONAL: 99.0,
            SubscriptionTier.ENTERPRISE: 299.0
        }
        return pricing.get(tier, 29.0)
    
    def calculate_next_billing_date(self, billing_cycle: BillingCycle) -> datetime:
        """Calculate next billing date based on billing cycle"""
        now = datetime.now()
        if billing_cycle == BillingCycle.MONTHLY:
            next_date = now + timedelta(days=30)
        elif billing_cycle == BillingCycle.QUARTERLY:
            next_date = now + timedelta(days=90)
        elif billing_cycle == BillingCycle.YEARLY:
            next_date = now + timedelta(days=365)
        else:
            next_date = now + timedelta(days=30)
        
        return next_date
    
    def create_client(self, client_data: Dict[str, Any]) -> Client:
        """Create a new client account"""
        try:
            # Generate client ID
            client_id = f"C{str(uuid.uuid4())[:8].upper()}"
            
            # Calculate pricing and billing
            subscription_tier = SubscriptionTier(client_data.get('subscription_tier', 'basic'))
            billing_cycle = BillingCycle(client_data.get('billing_cycle', 'monthly'))
            monthly_revenue = self.get_subscription_pricing(subscription_tier)
            next_billing_date = self.calculate_next_billing_date(billing_cycle)
            
            # Create client
            client = Client(
                id=client_id,
                company_name=client_data['company_name'],
                email=client_data['email'],
                phone=client_data['phone'],
                contact_person=client_data['contact_person'],
                address=client_data['address'],
                subscription_tier=subscription_tier,
                max_users=client_data.get('max_users', 5),
                billing_cycle=billing_cycle,
                custom_domain=client_data.get('custom_domain'),
                notes=client_data.get('notes'),
                monthly_revenue=monthly_revenue,
                next_billing_date=next_billing_date
            )
            
            self.db.add(client)
            
            # Initialize usage tracking
            usage = ClientUsage(
                id=f"U{str(uuid.uuid4())[:8].upper()}",
                client_id=client_id,
                date=datetime.now().date()
            )
            self.db.add(usage)
            
            # Create initial billing record
            billing = ClientBilling(
                id=f"B{str(uuid.uuid4())[:8].upper()}",
                client_id=client_id,
                amount=monthly_revenue,
                billing_cycle=billing_cycle,
                due_date=next_billing_date
            )
            self.db.add(billing)
            
            # Create default settings
            settings = ClientSettings(
                id=f"S{str(uuid.uuid4())[:8].upper()}",
                client_id=client_id
            )
            self.db.add(settings)
            
            self.db.commit()
            self.db.refresh(client)
            
            audit_logger.info(f"Created new client: {client_id}")
            return client
            
        except Exception as e:
            self.db.rollback()
            audit_logger.error(f"Error creating client: {str(e)}")
            raise
    
    def get_clients(
        self, 
        search: Optional[str] = None,
        status: Optional[ClientStatus] = None,
        subscription_tier: Optional[SubscriptionTier] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get clients with filtering and pagination"""
        try:
            query = self.db.query(Client)
            
            # Apply filters
            if search:
                search_lower = f"%{search.lower()}%"
                query = query.filter(
                    or_(
                        Client.company_name.ilike(search_lower),
                        Client.email.ilike(search_lower),
                        Client.contact_person.ilike(search_lower)
                    )
                )
            
            if status:
                query = query.filter(Client.status == status)
            
            if subscription_tier:
                query = query.filter(Client.subscription_tier == subscription_tier)
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination
            clients = query.offset(offset).limit(limit).all()
            
            # Add usage stats to each client
            for client in clients:
                client.usage_stats = self.get_client_usage_summary(client.id)
            
            return {
                "clients": clients,
                "total": total_count,
                "limit": limit,
                "offset": offset
            }
            
        except Exception as e:
            audit_logger.error(f"Error getting clients: {str(e)}")
            raise
    
    def get_client(self, client_id: str) -> Optional[Client]:
        """Get a specific client by ID"""
        try:
            client = self.db.query(Client).filter(Client.id == client_id).first()
            if client:
                client.usage_stats = self.get_client_usage_summary(client_id)
            return client
        except Exception as e:
            audit_logger.error(f"Error getting client {client_id}: {str(e)}")
            raise
    
    def update_client(self, client_id: str, update_data: Dict[str, Any]) -> Optional[Client]:
        """Update an existing client"""
        try:
            client = self.db.query(Client).filter(Client.id == client_id).first()
            if not client:
                return None
            
            # Update fields if provided
            for key, value in update_data.items():
                if hasattr(client, key) and value is not None:
                    if key == 'subscription_tier':
                        setattr(client, key, SubscriptionTier(value))
                        # Update pricing
                        client.monthly_revenue = self.get_subscription_pricing(SubscriptionTier(value))
                    elif key == 'billing_cycle':
                        setattr(client, key, BillingCycle(value))
                        # Update billing date
                        client.next_billing_date = self.calculate_next_billing_date(BillingCycle(value))
                    elif key == 'status':
                        setattr(client, key, ClientStatus(value))
                    else:
                        setattr(client, key, value)
            
            client.updated_at = datetime.now()
            self.db.commit()
            self.db.refresh(client)
            
            audit_logger.info(f"Updated client {client_id}")
            return client
            
        except Exception as e:
            self.db.rollback()
            audit_logger.error(f"Error updating client {client_id}: {str(e)}")
            raise
    
    def delete_client(self, client_id: str) -> bool:
        """Soft delete a client (change status to cancelled)"""
        try:
            client = self.db.query(Client).filter(Client.id == client_id).first()
            if not client:
                return False
            
            client.status = ClientStatus.CANCELLED
            client.updated_at = datetime.now()
            self.db.commit()
            
            audit_logger.info(f"Cancelled client {client_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            audit_logger.error(f"Error cancelling client {client_id}: {str(e)}")
            raise
    
    def get_client_usage_summary(self, client_id: str) -> Dict[str, int]:
        """Get usage summary for a client"""
        try:
            usage = self.db.query(ClientUsage).filter(
                ClientUsage.client_id == client_id
            ).order_by(desc(ClientUsage.date)).first()
            
            if usage:
                return {
                    "calls": usage.calls,
                    "emails": usage.emails,
                    "sms": usage.sms,
                    "whatsapp": usage.whatsapp,
                    "telegram": usage.telegram,
                    "slack": usage.slack,
                    "discord": usage.discord,
                    "fax": usage.fax
                }
            else:
                return {
                    "calls": 0, "emails": 0, "sms": 0, "whatsapp": 0,
                    "telegram": 0, "slack": 0, "discord": 0, "fax": 0
                }
                
        except Exception as e:
            audit_logger.error(f"Error getting usage for client {client_id}: {str(e)}")
            return {"calls": 0, "emails": 0, "sms": 0, "whatsapp": 0,
                    "telegram": 0, "slack": 0, "discord": 0, "fax": 0}
    
    def get_client_usage(self, client_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[ClientUsage]:
        """Get detailed usage for a client"""
        try:
            query = self.db.query(ClientUsage).filter(ClientUsage.client_id == client_id)
            
            if start_date:
                query = query.filter(ClientUsage.date >= datetime.strptime(start_date, "%Y-%m-%d").date())
            if end_date:
                query = query.filter(ClientUsage.date <= datetime.strptime(end_date, "%Y-%m-%d").date())
            
            return query.order_by(desc(ClientUsage.date)).all()
            
        except Exception as e:
            audit_logger.error(f"Error getting usage for client {client_id}: {str(e)}")
            raise
    
    def get_client_billing(self, client_id: str) -> List[ClientBilling]:
        """Get billing history for a client"""
        try:
            return self.db.query(ClientBilling).filter(
                ClientBilling.client_id == client_id
            ).order_by(desc(ClientBilling.created_at)).all()
            
        except Exception as e:
            audit_logger.error(f"Error getting billing for client {client_id}: {str(e)}")
            raise
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get overall client analytics"""
        try:
            total_clients = self.db.query(Client).count()
            active_clients = self.db.query(Client).filter(Client.status == ClientStatus.ACTIVE).count()
            
            # Calculate total revenue
            active_clients_list = self.db.query(Client).filter(Client.status == ClientStatus.ACTIVE).all()
            total_revenue = sum(client.monthly_revenue for client in active_clients_list)
            avg_revenue = total_revenue / active_clients if active_clients > 0 else 0
            
            # Subscription breakdown
            subscription_breakdown = {}
            for tier in SubscriptionTier:
                count = self.db.query(Client).filter(Client.subscription_tier == tier).count()
                subscription_breakdown[tier.value] = count
            
            # Status breakdown
            status_breakdown = {}
            for status in ClientStatus:
                count = self.db.query(Client).filter(Client.status == status).count()
                status_breakdown[status.value] = count
            
            # Recent clients
            recent_clients = self.db.query(Client).order_by(desc(Client.created_at)).limit(5).all()
            
            return {
                "total_clients": total_clients,
                "active_clients": active_clients,
                "total_monthly_revenue": total_revenue,
                "average_revenue_per_client": avg_revenue,
                "subscription_breakdown": subscription_breakdown,
                "status_breakdown": status_breakdown,
                "recent_clients": recent_clients
            }
            
        except Exception as e:
            audit_logger.error(f"Error getting analytics: {str(e)}")
            raise
    
    def suspend_client(self, client_id: str, reason: Optional[str] = None) -> bool:
        """Suspend a client account"""
        try:
            client = self.db.query(Client).filter(Client.id == client_id).first()
            if not client:
                return False
            
            client.status = ClientStatus.SUSPENDED
            client.updated_at = datetime.now()
            self.db.commit()
            
            audit_logger.info(f"Suspended client {client_id}. Reason: {reason}")
            return True
            
        except Exception as e:
            self.db.rollback()
            audit_logger.error(f"Error suspending client {client_id}: {str(e)}")
            raise
    
    def activate_client(self, client_id: str) -> bool:
        """Activate a suspended client account"""
        try:
            client = self.db.query(Client).filter(Client.id == client_id).first()
            if not client:
                return False
            
            client.status = ClientStatus.ACTIVE
            client.updated_at = datetime.now()
            self.db.commit()
            
            audit_logger.info(f"Activated client {client_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            audit_logger.error(f"Error activating client {client_id}: {str(e)}")
            raise
    
    def log_activity(self, client_id: str, action: str, user_id: Optional[str] = None, 
                    resource_type: Optional[str] = None, resource_id: Optional[str] = None,
                    details: Optional[str] = None, ip_address: Optional[str] = None,
                    user_agent: Optional[str] = None) -> None:
        """Log client activity"""
        try:
            activity = ClientActivity(
                id=f"A{str(uuid.uuid4())[:8].upper()}",
                client_id=client_id,
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            self.db.add(activity)
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            audit_logger.error(f"Error logging activity: {str(e)}")
