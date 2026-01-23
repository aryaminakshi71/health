"""
Monitoring API endpoints
Provides system status, metrics, and health check endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.core.monitoring import (
    get_system_status, metrics_collector, health_checker,
    get_cache_stats
)
from app.core.auth import get_current_user_dev_optional
from app.core.cache import cache_manager

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Communication Hub API"
    }

@router.get("/status")
async def system_status():
    """Get comprehensive system status"""
    return get_system_status()

@router.get("/metrics")
async def get_metrics(hours: int = 24):
    """Get system metrics for the last N hours"""
    try:
        return metrics_collector.get_metrics_summary(hours)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health-checks")
async def get_health_checks():
    """Get detailed health check results"""
    try:
        checks = health_checker.perform_health_checks()
        return {
            "timestamp": datetime.now().isoformat(),
            "overall_health": health_checker.get_overall_health(),
            "checks": [
                {
                    "service": check.service,
                    "status": check.status,
                    "response_time": check.response_time,
                    "error_message": check.error_message,
                    "last_check": check.last_check.isoformat() if check.last_check else None
                }
                for check in checks
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cache/stats")
async def cache_statistics():
    """Get cache statistics"""
    try:
        return get_cache_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cache/clear")
async def clear_cache(pattern: str = "*"):
    """Clear cache entries matching pattern"""
    try:
        success = cache_manager.clear(pattern)
        return {
            "success": success,
            "pattern": pattern,
            "message": f"Cache cleared for pattern: {pattern}" if success else "Failed to clear cache"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance")
async def performance_metrics():
    """Get performance metrics"""
    try:
        # Get recent metrics
        system_metrics = metrics_collector.collect_system_metrics()
        app_metrics = metrics_collector.collect_application_metrics()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_percent": system_metrics.cpu_percent if system_metrics else 0,
                "memory_percent": system_metrics.memory_percent if system_metrics else 0,
                "disk_usage_percent": system_metrics.disk_usage_percent if system_metrics else 0,
                "uptime_hours": round(system_metrics.uptime_seconds / 3600, 2) if system_metrics else 0
            },
            "application": {
                "request_count": app_metrics.request_count if app_metrics else 0,
                "error_count": app_metrics.error_count if app_metrics else 0,
                "response_time_avg_ms": round(app_metrics.response_time_avg * 1000, 2) if app_metrics else 0,
                "response_time_p95_ms": round(app_metrics.response_time_p95 * 1000, 2) if app_metrics else 0,
                "response_time_p99_ms": round(app_metrics.response_time_p99 * 1000, 2) if app_metrics else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_alerts():
    """Get system alerts and warnings"""
    try:
        alerts = []
        
        # Check system metrics for alerts
        system_metrics = metrics_collector.collect_system_metrics()
        if system_metrics:
            if system_metrics.cpu_percent > 80:
                alerts.append({
                    "level": "warning",
                    "message": f"High CPU usage: {system_metrics.cpu_percent}%",
                    "timestamp": datetime.now().isoformat()
                })
            
            if system_metrics.memory_percent > 85:
                alerts.append({
                    "level": "warning",
                    "message": f"High memory usage: {system_metrics.memory_percent}%",
                    "timestamp": datetime.now().isoformat()
                })
            
            if system_metrics.disk_usage_percent > 90:
                alerts.append({
                    "level": "critical",
                    "message": f"High disk usage: {system_metrics.disk_usage_percent}%",
                    "timestamp": datetime.now().isoformat()
                })
        
        # Check application metrics for alerts
        app_metrics = metrics_collector.collect_application_metrics()
        if app_metrics:
            if app_metrics.error_count > 10:
                alerts.append({
                    "level": "error",
                    "message": f"High error rate: {app_metrics.error_count} errors in last minute",
                    "timestamp": datetime.now().isoformat()
                })
            
            if app_metrics.response_time_avg > 2.0:  # 2 seconds
                alerts.append({
                    "level": "warning",
                    "message": f"Slow response time: {round(app_metrics.response_time_avg * 1000, 2)}ms average",
                    "timestamp": datetime.now().isoformat()
                })
        
        # Check health checks for alerts
        health_checks = health_checker.perform_health_checks()
        for check in health_checks:
            if check.status == 'unhealthy':
                alerts.append({
                    "level": "critical",
                    "message": f"Service {check.service} is unhealthy: {check.error_message}",
                    "timestamp": datetime.now().isoformat()
                })
            elif check.status == 'degraded':
                alerts.append({
                    "level": "warning",
                    "message": f"Service {check.service} is degraded: {check.error_message}",
                    "timestamp": datetime.now().isoformat()
                })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "alerts": alerts,
            "alert_count": len(alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_recent_logs(limit: int = 100):
    """Get recent application logs"""
    try:
        # This would typically connect to a logging service
        # For now, return mock log data
        logs = [
            {
                "timestamp": datetime.now().isoformat(),
                "level": "INFO",
                "message": "Application started successfully",
                "service": "api"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                "level": "INFO",
                "message": "User authentication successful",
                "service": "auth"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
                "level": "WARNING",
                "message": "High memory usage detected",
                "service": "monitoring"
            }
        ]
        
        return {
            "logs": logs[:limit],
            "total": len(logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def monitoring_dashboard():
    """Get comprehensive monitoring dashboard data"""
    try:
        # Collect all monitoring data
        system_status = get_system_status()
        cache_stats = get_cache_stats()
        alerts = await get_alerts()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "system_status": system_status,
            "cache_stats": cache_stats,
            "alerts": alerts,
            "summary": {
                "overall_health": system_status.get("overall_health", "unknown"),
                "active_alerts": alerts.get("alert_count", 0),
                "cache_hit_rate": cache_stats.get("memory_cache_size", 0),
                "uptime_hours": system_status.get("summary", {}).get("system_metrics", {}).get("uptime_hours", 0)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
