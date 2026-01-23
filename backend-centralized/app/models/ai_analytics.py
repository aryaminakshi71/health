"""
AI Analytics Models (Enhanced with Healthcare)
Models for AI analytics application including healthcare analytics
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime
import json

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # classification, regression, clustering, etc.
    algorithm = Column(String(100))  # random_forest, neural_network, svm, etc.
    version = Column(String(20), default='1.0.0')
    description = Column(Text)
    model_path = Column(String(255))  # Path to saved model file
    hyperparameters = Column(Text)  # JSON string of hyperparameters
    training_data_size = Column(Integer)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    status = Column(String(20), default='training')  # training, active, inactive, deprecated
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_trained = Column(DateTime)
    
    # Relationships
    created_by_user = relationship("User")
    predictions = relationship("Prediction", back_populates="model")
    training_sessions = relationship("TrainingSession", back_populates="model")
    
    def get_hyperparameters_dict(self) -> dict:
        """Get hyperparameters as dictionary"""
        if self.hyperparameters:
            return json.loads(self.hyperparameters)
        return {}
    
    def set_hyperparameters(self, params: dict):
        """Set hyperparameters from dictionary"""
        self.hyperparameters = json.dumps(params)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    input_data = Column(Text)  # JSON string of input features
    prediction_result = Column(Text)  # JSON string of prediction output
    confidence_score = Column(Float)
    prediction_type = Column(String(50))  # classification, regression, anomaly, etc.
    actual_result = Column(Text)  # Ground truth for validation
    is_correct = Column(Boolean)  # For classification tasks
    error_rate = Column(Float)  # For regression tasks
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    model = relationship("MLModel", back_populates="predictions")

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_type = Column(String(50))  # database, api, file, stream, etc.
    connection_string = Column(Text)
    schema_info = Column(Text)  # JSON string of data schema
    refresh_frequency = Column(String(50))  # daily, hourly, real-time, etc.
    last_refresh = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User")
    data_feeds = relationship("DataFeed", back_populates="source")
    
    def get_schema_dict(self) -> dict:
        """Get schema info as dictionary"""
        if self.schema_info:
            return json.loads(self.schema_info)
        return {}

class DataFeed(Base):
    __tablename__ = "data_feeds"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey('data_sources.id'), nullable=False)
    feed_name = Column(String(100), nullable=False)
    data_type = Column(String(50))  # structured, unstructured, semi-structured
    record_count = Column(Integer)
    file_size = Column(Integer)  # in bytes
    last_updated = Column(DateTime)
    status = Column(String(20), default='active')  # active, inactive, error
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    source = relationship("DataSource", back_populates="data_feeds")

class TrainingSession(Base):
    __tablename__ = "training_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    session_name = Column(String(100), nullable=False)
    training_data_size = Column(Integer)
    validation_data_size = Column(Integer)
    epochs = Column(Integer)
    batch_size = Column(Integer)
    learning_rate = Column(Float)
    training_accuracy = Column(Float)
    validation_accuracy = Column(Float)
    training_loss = Column(Float)
    validation_loss = Column(Float)
    duration_minutes = Column(Integer)
    status = Column(String(20), default='running')  # running, completed, failed
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    model = relationship("MLModel", back_populates="training_sessions")
    created_by_user = relationship("User")

class ModelPerformance(Base):
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    metric_name = Column(String(50), nullable=False)  # accuracy, precision, recall, f1, etc.
    metric_value = Column(Float, nullable=False)
    evaluation_date = Column(DateTime, default=func.now())
    dataset_size = Column(Integer)
    notes = Column(Text)
    
    # Relationships
    model = relationship("MLModel")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)  # page_view, click, conversion, etc.
    user_id = Column(Integer, ForeignKey('users.id'))
    session_id = Column(String(100))
    page_url = Column(String(255))
    referrer = Column(String(255))
    user_agent = Column(Text)
    ip_address = Column(String(45))
    event_data = Column(Text)  # JSON string of additional event data
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    
    def get_event_data_dict(self) -> dict:
        """Get event data as dictionary"""
        if self.event_data:
            return json.loads(self.event_data)
        return {}

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    insight_type = Column(String(50))  # trend, anomaly, pattern, recommendation
    confidence_score = Column(Float)
    data_source = Column(String(100))
    affected_metrics = Column(Text)  # JSON string of affected metrics
    recommendations = Column(Text)
    is_actionable = Column(Boolean, default=True)
    priority = Column(String(20))  # low, medium, high, critical
    status = Column(String(20), default='new')  # new, reviewed, implemented, dismissed
    created_at = Column(DateTime, default=func.now())
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    reviewed_by_user = relationship("User")

class Dashboard(Base):
    __tablename__ = "dashboards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    layout_config = Column(Text)  # JSON string of dashboard layout
    refresh_interval = Column(Integer)  # in seconds
    is_public = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User")
    widgets = relationship("DashboardWidget", back_populates="dashboard")
    
    def get_layout_config_dict(self) -> dict:
        """Get layout config as dictionary"""
        if self.layout_config:
            return json.loads(self.layout_config)
        return {}

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"
    
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey('dashboards.id'), nullable=False)
    widget_type = Column(String(50), nullable=False)  # chart, metric, table, etc.
    title = Column(String(100), nullable=False)
    config = Column(Text)  # JSON string of widget configuration
    position_x = Column(Integer)
    position_y = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")
    
    def get_config_dict(self) -> dict:
        """Get widget config as dictionary"""
        if self.config:
            return json.loads(self.config)
        return {}

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)  # threshold, anomaly, trend
    title = Column(String(200), nullable=False)
    description = Column(Text)
    metric_name = Column(String(100))
    threshold_value = Column(Float)
    current_value = Column(Float)
    severity = Column(String(20))  # low, medium, high, critical
    status = Column(String(20), default='active')  # active, acknowledged, resolved
    created_at = Column(DateTime, default=func.now())
    acknowledged_at = Column(DateTime)
    acknowledged_by = Column(Integer, ForeignKey('users.id'))
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    acknowledged_by_user = relationship("User", foreign_keys=[acknowledged_by])
    resolved_by_user = relationship("User", foreign_keys=[resolved_by])

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    report_type = Column(String(50))  # daily, weekly, monthly, custom
    description = Column(Text)
    query_config = Column(Text)  # JSON string of report query configuration
    schedule = Column(String(100))  # cron expression for scheduling
    last_generated = Column(DateTime)
    next_generation = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User")
    report_runs = relationship("ReportRun", back_populates="report")
    
    def get_query_config_dict(self) -> dict:
        """Get query config as dictionary"""
        if self.query_config:
            return json.loads(self.query_config)
        return {}

class ReportRun(Base):
    __tablename__ = "report_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey('reports.id'), nullable=False)
    run_date = Column(DateTime, default=func.now())
    status = Column(String(20), default='running')  # running, completed, failed
    file_path = Column(String(255))  # Path to generated report file
    file_size = Column(Integer)
    execution_time = Column(Integer)  # in seconds
    error_message = Column(Text)
    
    # Relationships
    report = relationship("Report", back_populates="report_runs")

# AI Analytics constants
MODEL_TYPES = [
    'classification', 'regression', 'clustering', 'recommendation', 'anomaly_detection'
]

ALGORITHMS = [
    'random_forest', 'neural_network', 'svm', 'logistic_regression', 'linear_regression',
    'kmeans', 'dbscan', 'xgboost', 'lightgbm', 'catboost'
]

PREDICTION_TYPES = [
    'classification', 'regression', 'anomaly', 'recommendation', 'forecasting'
]

INSIGHT_TYPES = [
    'trend', 'anomaly', 'pattern', 'recommendation', 'correlation'
]

WIDGET_TYPES = [
    'line_chart', 'bar_chart', 'pie_chart', 'scatter_plot', 'table', 'metric', 'gauge'
]

ALERT_SEVERITIES = [
    'low', 'medium', 'high', 'critical'
]
