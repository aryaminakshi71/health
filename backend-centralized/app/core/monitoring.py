"""
Monitoring and Observability System
Handles application monitoring, metrics, and health checks
"""

import time
import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import threading
import json

logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System performance metrics"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used: int
    memory_total: int
    disk_usage_percent: float
    disk_used: int
    disk_total: int
    network_bytes_sent: int
    network_bytes_recv: int
    active_connections: int
    uptime_seconds: float

@dataclass
class ApplicationMetrics:
    """Application-specific metrics"""
    timestamp: datetime
    request_count: int
    error_count: int
    response_time_avg: float
    response_time_p95: float
    response_time_p99: float
    active_users: int
    cache_hit_rate: float
    database_connections: int
    background_tasks: int

@dataclass
class HealthCheck:
    """Health check result"""
    service: str
    status: str  # 'healthy', 'degraded', 'unhealthy'
    response_time: float
    error_message: Optional[str] = None
    last_check: datetime = None

class MetricsCollector:
    """Collects and stores application metrics"""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.system_metrics: deque = deque(maxlen=max_history)
        self.application_metrics: deque = deque(maxlen=max_history)
        self.request_times: deque = deque(maxlen=max_history)
        self.error_log: deque = deque(maxlen=max_history)
        self.lock = threading.Lock()
        
        # Initialize baseline metrics
        self._baseline_network = psutil.net_io_counters()
        self._baseline_time = time.time()
    
    def collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            # Calculate network delta
            bytes_sent = network.bytes_sent - self._baseline_network.bytes_sent
            bytes_recv = network.bytes_recv - self._baseline_network.bytes_recv
            
            metrics = SystemMetrics(
                timestamp=datetime.now(),
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_used=memory.used,
                memory_total=memory.total,
                disk_usage_percent=disk.percent,
                disk_used=disk.used,
                disk_total=disk.total,
                network_bytes_sent=bytes_sent,
                network_bytes_recv=bytes_recv,
                active_connections=0,  # Will be updated by connection tracking
                uptime_seconds=time.time() - self._baseline_time
            )
            
            with self.lock:
                self.system_metrics.append(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return None
    
    def record_request(self, response_time: float, status_code: int = 200):
        """Record a request metric"""
        with self.lock:
            self.request_times.append({
                'timestamp': datetime.now(),
                'response_time': response_time,
                'status_code': status_code
            })
    
    def record_error(self, error: Exception, context: str = ""):
        """Record an error"""
        with self.lock:
            self.error_log.append({
                'timestamp': datetime.now(),
                'error': str(error),
                'error_type': type(error).__name__,
                'context': context
            })
    
    def collect_application_metrics(self) -> ApplicationMetrics:
        """Collect current application metrics"""
        try:
            # Calculate response time percentiles
            recent_times = [r['response_time'] for r in list(self.request_times)[-100:]]
            if recent_times:
                recent_times.sort()
                avg_time = sum(recent_times) / len(recent_times)
                p95_index = int(len(recent_times) * 0.95)
                p99_index = int(len(recent_times) * 0.99)
                p95_time = recent_times[p95_index] if p95_index < len(recent_times) else 0
                p99_time = recent_times[p99_index] if p99_index < len(recent_times) else 0
            else:
                avg_time = p95_time = p99_time = 0
            
            # Count recent requests and errors
            recent_requests = [r for r in list(self.request_times)[-100:] 
                             if (datetime.now() - r['timestamp']).seconds < 60]
            recent_errors = [e for e in list(self.error_log)[-100:] 
                           if (datetime.now() - e['timestamp']).seconds < 60]
            
            metrics = ApplicationMetrics(
                timestamp=datetime.now(),
                request_count=len(recent_requests),
                error_count=len(recent_errors),
                response_time_avg=avg_time,
                response_time_p95=p95_time,
                response_time_p99=p99_time,
                active_users=0,  # Will be updated by user tracking
                cache_hit_rate=0.0,  # Will be updated by cache tracking
                database_connections=0,  # Will be updated by DB tracking
                background_tasks=0  # Will be updated by task tracking
            )
            
            with self.lock:
                self.application_metrics.append(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting application metrics: {e}")
            return None
    
    def get_metrics_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get metrics summary for the last N hours"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        with self.lock:
            recent_system = [m for m in self.system_metrics if m.timestamp > cutoff_time]
            recent_app = [m for m in self.application_metrics if m.timestamp > cutoff_time]
            recent_requests = [r for r in self.request_times if r['timestamp'] > cutoff_time]
            recent_errors = [e for e in self.error_log if e['timestamp'] > cutoff_time]
        
        if not recent_system:
            return {'error': 'No metrics available'}
        
        # Calculate averages
        avg_cpu = sum(m.cpu_percent for m in recent_system) / len(recent_system)
        avg_memory = sum(m.memory_percent for m in recent_system) / len(recent_system)
        avg_response_time = sum(r['response_time'] for r in recent_requests) / len(recent_requests) if recent_requests else 0
        
        return {
            'period_hours': hours,
            'system_metrics': {
                'avg_cpu_percent': round(avg_cpu, 2),
                'avg_memory_percent': round(avg_memory, 2),
                'current_cpu': recent_system[-1].cpu_percent if recent_system else 0,
                'current_memory': recent_system[-1].memory_percent if recent_system else 0,
                'uptime_hours': round(recent_system[-1].uptime_seconds / 3600, 2) if recent_system else 0
            },
            'application_metrics': {
                'total_requests': len(recent_requests),
                'total_errors': len(recent_errors),
                'error_rate': round(len(recent_errors) / len(recent_requests) * 100, 2) if recent_requests else 0,
                'avg_response_time_ms': round(avg_response_time * 1000, 2),
                'requests_per_minute': round(len(recent_requests) / (hours * 60), 2)
            },
            'latest_metrics': {
                'system': asdict(recent_system[-1]) if recent_system else None,
                'application': asdict(recent_app[-1]) if recent_app else None
            }
        }

class HealthChecker:
    """Performs health checks on various services"""
    
    def __init__(self):
        self.health_checks: Dict[str, HealthCheck] = {}
        self.check_interval = 30  # seconds
    
    def add_health_check(self, service: str, check_func):
        """Add a health check function for a service"""
        self.health_checks[service] = HealthCheck(
            service=service,
            status='unknown',
            response_time=0.0,
            last_check=None
        )
    
    def perform_health_checks(self) -> List[HealthCheck]:
        """Perform all health checks"""
        results = []
        
        for service, health_check in self.health_checks.items():
            try:
                start_time = time.time()
                
                # Perform the actual health check
                if service == 'database':
                    result = self._check_database()
                elif service == 'cache':
                    result = self._check_cache()
                elif service == 'external_api':
                    result = self._check_external_api()
                else:
                    result = {'status': 'unknown', 'error': 'Unknown service'}
                
                response_time = time.time() - start_time
                
                # Update health check
                health_check.status = result.get('status', 'unknown')
                health_check.response_time = response_time
                health_check.error_message = result.get('error')
                health_check.last_check = datetime.now()
                
                results.append(health_check)
                
            except Exception as e:
                health_check.status = 'unhealthy'
                health_check.error_message = str(e)
                health_check.last_check = datetime.now()
                results.append(health_check)
        
        return results
    
    def _check_database(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            from app.core.database import get_db
            from sqlalchemy import text
            
            db = next(get_db())
            result = db.execute(text("SELECT 1"))
            result.fetchone()
            
            return {'status': 'healthy'}
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}
    
    def _check_cache(self) -> Dict[str, Any]:
        """Check cache health"""
        try:
            from app.core.cache import cache_manager
            
            # Test cache operations
            test_key = "health_check_test"
            test_value = "test"
            
            cache_manager.set(test_key, test_value, 10)
            retrieved = cache_manager.get(test_key)
            cache_manager.delete(test_key)
            
            if retrieved == test_value:
                return {'status': 'healthy'}
            else:
                return {'status': 'degraded', 'error': 'Cache read/write mismatch'}
                
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}
    
    def _check_external_api(self) -> Dict[str, Any]:
        """Check external API health"""
        try:
            import requests
            
            # Check a simple external service
            response = requests.get('https://httpbin.org/status/200', timeout=5)
            
            if response.status_code == 200:
                return {'status': 'healthy'}
            else:
                return {'status': 'degraded', 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}
    
    def get_overall_health(self) -> str:
        """Get overall system health status"""
        checks = self.perform_health_checks()
        
        if not checks:
            return 'unknown'
        
        unhealthy_count = sum(1 for check in checks if check.status == 'unhealthy')
        degraded_count = sum(1 for check in checks if check.status == 'degraded')
        
        if unhealthy_count > 0:
            return 'unhealthy'
        elif degraded_count > 0:
            return 'degraded'
        else:
            return 'healthy'

class MonitoringMiddleware:
    """FastAPI middleware for request monitoring"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics_collector = metrics_collector
    
    async def __call__(self, request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            response_time = time.time() - start_time
            
            # Record successful request
            self.metrics_collector.record_request(response_time, response.status_code)
            
            return response
            
        except Exception as e:
            response_time = time.time() - start_time
            
            # Record failed request
            self.metrics_collector.record_request(response_time, 500)
            self.metrics_collector.record_error(e, f"Request to {request.url.path}")
            
            raise

# Global instances
metrics_collector = MetricsCollector()
health_checker = HealthChecker()

# Initialize health checks
health_checker.add_health_check('database', health_checker._check_database)
health_checker.add_health_check('cache', health_checker._check_cache)
health_checker.add_health_check('external_api', health_checker._check_external_api)

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    try:
        # Mock cache stats for now
        return {
            'hits': 0,
            'misses': 0,
            'hit_rate': 0.0,
            'size': 0,
            'max_size': 1000
        }
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        return {
            'error': str(e)
        }

def get_system_status() -> Dict[str, Any]:
    """Get current system status"""
    try:
        # Collect current metrics
        system_metrics = metrics_collector.collect_system_metrics()
        app_metrics = metrics_collector.collect_application_metrics()
        health_checks = health_checker.perform_health_checks()
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall_health': health_checker.get_overall_health(),
            'system_metrics': asdict(system_metrics) if system_metrics else None,
            'application_metrics': asdict(app_metrics) if app_metrics else None,
            'health_checks': [asdict(check) for check in health_checks],
            'summary': metrics_collector.get_metrics_summary(1)  # Last hour
        }
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        return {
            'timestamp': datetime.now().isoformat(),
            'error': str(e),
            'overall_health': 'unknown'
        }
