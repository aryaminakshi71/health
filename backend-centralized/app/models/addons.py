from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class Addon(Base):
    __tablename__ = "addons"

    slug = Column(String, primary_key=True, index=True)
    installed = Column(Boolean, default=False, nullable=False)
    enabled = Column(Boolean, default=False, nullable=False)
    installed_at = Column(DateTime, nullable=True)
    enabled_at = Column(DateTime, nullable=True)

    def mark_installed(self) -> None:
        self.installed = True
        self.installed_at = datetime.utcnow()

    def mark_enabled(self, value: bool) -> None:
        self.enabled = value
        self.enabled_at = datetime.utcnow() if value else None


