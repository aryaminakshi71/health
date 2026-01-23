"""
Advanced Analytics Service
Comprehensive analytics and reporting for surveillance system
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import asyncio
from dataclasses import dataclass
from enum import Enum
import statistics

logger = logging.getLogger(__name__)

class AnalyticsPeriod(Enum):
    """Analytics time periods"""
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"

@dataclass
class AnalyticsMetric:
    """Analytics metric data"""
    name: str
    value: float
    unit: str
    trend: float  # Percentage change
    timestamp: datetime
    metadata: Dict[str, Any]

@dataclass
class AnalyticsReport:
    """Analytics report"""
    id: str
    title: str
    period: AnalyticsPeriod
    start_date: datetime
    end_date: datetime
    metrics: List[AnalyticsMetric]
    insights: List[str]
    recommendations: List[str]
    generated_at: datetime

class AdvancedAnalyticsService:
    """Advanced analytics service for surveillance data"""
    
    def __init__(self):
        self.metrics_history = []
        self.reports_history = []
        self.max_history = 10000
        
    async def generate_comprehensive_analytics(self, 
                                             cameras: List[Dict], 
                                             recordings: List[Dict], 
                                             alerts: List[Dict],
                                             motion_events: List[Dict] = None) -> Dict[str, Any]:
        """Generate comprehensive analytics for the surveillance system"""
        
        analytics = {
            "system_overview": await self._generate_system_overview(cameras, recordings, alerts),
            "security_metrics": await self._generate_security_metrics(alerts, motion_events),
            "operational_metrics": await self._generate_operational_metrics(cameras, recordings),
            "performance_metrics": await self._generate_performance_metrics(cameras),
            "trend_analysis": await self._generate_trend_analysis(recordings, alerts),
            "anomaly_detection": await self._detect_anomalies(alerts, motion_events),
            "predictive_insights": await self._generate_predictive_insights(recordings, alerts),
            "compliance_metrics": await self._generate_compliance_metrics(recordings, alerts),
            "cost_analysis": await self._generate_cost_analysis(recordings, cameras),
            "recommendations": await self._generate_recommendations(cameras, recordings, alerts)
        }
        
        return analytics
    
    async def _generate_system_overview(self, cameras: List[Dict], recordings: List[Dict], alerts: List[Dict]) -> Dict[str, Any]:
        """Generate system overview metrics"""
        
        total_cameras = len(cameras)
        active_cameras = len([c for c in cameras if c.get('status') == 'active'])
        total_recordings = len(recordings)
        total_alerts = len(alerts)
        
        # Calculate storage usage
        total_storage = sum(c.get('storage_used', 0) for c in cameras)
        max_storage = sum(c.get('storage_total', 100) for c in cameras)
        storage_utilization = (total_storage / max_storage * 100) if max_storage > 0 else 0
        
        # Calculate uptime
        total_uptime = sum(c.get('uptime', 0) for c in cameras)
        avg_uptime = total_uptime / total_cameras if total_cameras > 0 else 0
        
        return {
            "total_cameras": total_cameras,
            "active_cameras": active_cameras,
            "camera_health": (active_cameras / total_cameras * 100) if total_cameras > 0 else 0,
            "total_recordings": total_recordings,
            "total_alerts": total_alerts,
            "storage_utilization": storage_utilization,
            "average_uptime": avg_uptime,
            "system_health_score": self._calculate_system_health_score(cameras, recordings, alerts)
        }
    
    async def _generate_security_metrics(self, alerts: List[Dict], motion_events: List[Dict] = None) -> Dict[str, Any]:
        """Generate security-related metrics"""
        
        if not alerts:
            return {}
        
        # Alert analysis
        alert_types = {}
        severity_distribution = {}
        resolution_times = []
        
        for alert in alerts:
            # Count alert types
            alert_type = alert.get('type', 'unknown')
            alert_types[alert_type] = alert_types.get(alert_type, 0) + 1
            
            # Count severity levels
            severity = alert.get('severity', 'low')
            severity_distribution[severity] = severity_distribution.get(severity, 0) + 1
            
            # Calculate resolution time if resolved
            if alert.get('status') == 'resolved':
                created_time = datetime.fromisoformat(alert.get('timestamp', '').replace('Z', '+00:00'))
                resolved_time = datetime.now()  # In real app, get actual resolved time
                resolution_time = (resolved_time - created_time).total_seconds() / 3600  # hours
                resolution_times.append(resolution_time)
        
        # Motion event analysis
        motion_metrics = {}
        if motion_events:
            motion_metrics = {
                "total_motion_events": len(motion_events),
                "events_last_24h": len([e for e in motion_events if 
                    (datetime.now() - datetime.fromisoformat(e.get('timestamp', '').replace('Z', '+00:00'))).days < 1]),
                "average_confidence": statistics.mean([e.get('confidence', 0) for e in motion_events]) if motion_events else 0
            }
        
        return {
            "alert_analysis": {
                "total_alerts": len(alerts),
                "alert_types": alert_types,
                "severity_distribution": severity_distribution,
                "average_resolution_time": statistics.mean(resolution_times) if resolution_times else 0,
                "alerts_per_day": len(alerts) / 30  # Assuming 30 days of data
            },
            "motion_analysis": motion_metrics,
            "security_score": self._calculate_security_score(alerts, motion_events),
            "threat_level": self._calculate_threat_level(alerts, motion_events)
        }
    
    async def _generate_operational_metrics(self, cameras: List[Dict], recordings: List[Dict]) -> Dict[str, Any]:
        """Generate operational metrics"""
        
        # Recording analysis
        recording_durations = [r.get('duration', 0) for r in recordings]
        recording_sizes = [r.get('file_size', 0) for r in recordings]
        
        # Camera performance
        camera_performances = []
        for camera in cameras:
            uptime = camera.get('uptime', 0)
            storage_used = camera.get('storage_used', 0)
            storage_total = camera.get('storage_total', 100)
            
            performance_score = (uptime * 0.6) + ((1 - storage_used/storage_total) * 40) if storage_total > 0 else uptime
            camera_performances.append(performance_score)
        
        return {
            "recording_metrics": {
                "total_recordings": len(recordings),
                "average_duration": statistics.mean(recording_durations) if recording_durations else 0,
                "total_storage_used": sum(recording_sizes),
                "average_file_size": statistics.mean(recording_sizes) if recording_sizes else 0,
                "recordings_per_day": len(recordings) / 30  # Assuming 30 days
            },
            "camera_performance": {
                "average_performance_score": statistics.mean(camera_performances) if camera_performances else 0,
                "best_performing_camera": max(cameras, key=lambda c: c.get('uptime', 0)) if cameras else None,
                "cameras_needing_maintenance": len([c for c in cameras if c.get('uptime', 100) < 90])
            },
            "operational_efficiency": self._calculate_operational_efficiency(cameras, recordings)
        }
    
    async def _generate_performance_metrics(self, cameras: List[Dict]) -> Dict[str, Any]:
        """Generate performance metrics"""
        
        if not cameras:
            return {}
        
        uptimes = [c.get('uptime', 0) for c in cameras]
        storage_utilizations = [c.get('storage_used', 0) / c.get('storage_total', 100) * 100 for c in cameras]
        
        return {
            "system_performance": {
                "average_uptime": statistics.mean(uptimes),
                "min_uptime": min(uptimes),
                "max_uptime": max(uptimes),
                "uptime_consistency": statistics.stdev(uptimes) if len(uptimes) > 1 else 0
            },
            "storage_performance": {
                "average_utilization": statistics.mean(storage_utilizations),
                "storage_efficiency": 100 - statistics.mean(storage_utilizations),
                "storage_distribution": {
                    "low": len([u for u in storage_utilizations if u < 30]),
                    "medium": len([u for u in storage_utilizations if 30 <= u < 70]),
                    "high": len([u for u in storage_utilizations if u >= 70])
                }
            },
            "network_performance": {
                "average_bandwidth_usage": 0,  # Would need network metrics
                "connection_stability": 95.0  # Placeholder
            }
        }
    
    async def _generate_trend_analysis(self, recordings: List[Dict], alerts: List[Dict]) -> Dict[str, Any]:
        """Generate trend analysis"""
        
        # Time-based analysis
        now = datetime.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)
        
        # Recording trends
        recent_recordings = [r for r in recordings if 
            datetime.fromisoformat(r.get('start_time', '').replace('Z', '+00:00')) > last_7_days]
        
        # Alert trends
        recent_alerts = [a for a in alerts if 
            datetime.fromisoformat(a.get('timestamp', '').replace('Z', '+00:00')) > last_7_days]
        
        return {
            "recording_trends": {
                "daily_average": len(recent_recordings) / 7,
                "weekly_change": self._calculate_percentage_change(
                    len([r for r in recordings if 
                        datetime.fromisoformat(r.get('start_time', '').replace('Z', '+00:00')) > last_30_days]),
                    len(recent_recordings)
                ),
                "peak_hours": self._find_peak_hours(recordings)
            },
            "alert_trends": {
                "daily_average": len(recent_alerts) / 7,
                "weekly_change": self._calculate_percentage_change(
                    len([a for a in alerts if 
                        datetime.fromisoformat(a.get('timestamp', '').replace('Z', '+00:00')) > last_30_days]),
                    len(recent_alerts)
                ),
                "alert_patterns": self._analyze_alert_patterns(alerts)
            }
        }
    
    async def _detect_anomalies(self, alerts: List[Dict], motion_events: List[Dict] = None) -> List[Dict[str, Any]]:
        """Detect anomalies in the system"""
        
        anomalies = []
        
        # Check for unusual alert patterns
        if alerts:
            recent_alerts = [a for a in alerts if 
                (datetime.now() - datetime.fromisoformat(a.get('timestamp', '').replace('Z', '+00:00'))).days < 1]
            
            if len(recent_alerts) > 20:  # High alert volume
                anomalies.append({
                    "type": "high_alert_volume",
                    "severity": "medium",
                    "description": f"Unusually high number of alerts: {len(recent_alerts)} in 24 hours",
                    "timestamp": datetime.now()
                })
            
            # Check for critical alert clusters
            critical_alerts = [a for a in recent_alerts if a.get('severity') == 'critical']
            if len(critical_alerts) > 5:
                anomalies.append({
                    "type": "critical_alert_cluster",
                    "severity": "high",
                    "description": f"Cluster of {len(critical_alerts)} critical alerts detected",
                    "timestamp": datetime.now()
                })
        
        # Check for motion anomalies
        if motion_events:
            recent_motion = [e for e in motion_events if 
                (datetime.now() - datetime.fromisoformat(e.get('timestamp', '').replace('Z', '+00:00'))).hours < 1]
            
            if len(recent_motion) > 50:  # High motion activity
                anomalies.append({
                    "type": "high_motion_activity",
                    "severity": "medium",
                    "description": f"Unusually high motion activity: {len(recent_motion)} events in 1 hour",
                    "timestamp": datetime.now()
                })
        
        return anomalies
    
    async def _generate_predictive_insights(self, recordings: List[Dict], alerts: List[Dict]) -> Dict[str, Any]:
        """Generate predictive insights"""
        
        # Simple predictive analysis (in production, use ML models)
        insights = {
            "storage_prediction": {
                "predicted_usage_30_days": self._predict_storage_usage(recordings, 30),
                "predicted_usage_90_days": self._predict_storage_usage(recordings, 90),
                "storage_optimization_recommendations": self._generate_storage_recommendations(recordings)
            },
            "alert_prediction": {
                "predicted_alerts_next_week": self._predict_alert_volume(alerts, 7),
                "high_risk_periods": self._identify_high_risk_periods(alerts),
                "preventive_measures": self._suggest_preventive_measures(alerts)
            },
            "maintenance_prediction": {
                "cameras_needing_maintenance": self._predict_maintenance_needs(recordings),
                "optimal_maintenance_schedule": self._generate_maintenance_schedule(recordings)
            }
        }
        
        return insights
    
    async def _generate_compliance_metrics(self, recordings: List[Dict], alerts: List[Dict]) -> Dict[str, Any]:
        """Generate compliance and audit metrics"""
        
        return {
            "data_retention": {
                "compliance_score": 95.0,  # Placeholder
                "retention_policy_adherence": 98.0,
                "data_integrity": 99.5
            },
            "access_control": {
                "unauthorized_access_attempts": len([a for a in alerts if a.get('type') == 'unauthorized']),
                "access_log_completeness": 100.0,
                "user_activity_tracking": 95.0
            },
            "audit_trail": {
                "audit_log_completeness": 100.0,
                "audit_trail_integrity": 99.8,
                "compliance_reports_generated": 12  # Monthly reports
            }
        }
    
    async def _generate_cost_analysis(self, recordings: List[Dict], cameras: List[Dict]) -> Dict[str, Any]:
        """Generate cost analysis"""
        
        # Calculate storage costs (example rates)
        storage_cost_per_gb = 0.02  # $0.02 per GB per month
        total_storage_gb = sum(r.get('file_size', 0) for r in recordings) / (1024**3)
        monthly_storage_cost = total_storage_gb * storage_cost_per_gb
        
        # Calculate operational costs
        camera_maintenance_cost = len(cameras) * 50  # $50 per camera per month
        system_administration_cost = 500  # $500 per month
        
        total_monthly_cost = monthly_storage_cost + camera_maintenance_cost + system_administration_cost
        
        return {
            "storage_costs": {
                "monthly_storage_cost": monthly_storage_cost,
                "storage_cost_trend": "increasing",
                "cost_optimization_opportunities": self._identify_cost_savings(recordings)
            },
            "operational_costs": {
                "camera_maintenance": camera_maintenance_cost,
                "system_administration": system_administration_cost,
                "total_monthly_cost": total_monthly_cost
            },
            "roi_analysis": {
                "cost_per_incident_prevented": total_monthly_cost / max(len([a for a in alerts if a.get('severity') == 'high']), 1),
                "value_generated": "High",  # Placeholder
                "cost_effectiveness_score": 85.0
            }
        }
    
    async def _generate_recommendations(self, cameras: List[Dict], recordings: List[Dict], alerts: List[Dict]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # Storage recommendations
        total_storage = sum(r.get('file_size', 0) for r in recordings)
        if total_storage > 100 * (1024**3):  # 100 GB
            recommendations.append({
                "category": "storage",
                "priority": "medium",
                "title": "Optimize Storage Usage",
                "description": "Consider implementing video compression or adjusting retention policies",
                "impact": "Reduce storage costs by 20-30%"
            })
        
        # Security recommendations
        critical_alerts = [a for a in alerts if a.get('severity') == 'critical']
        if len(critical_alerts) > 10:
            recommendations.append({
                "category": "security",
                "priority": "high",
                "title": "Enhance Security Measures",
                "description": "High number of critical alerts detected. Review security protocols",
                "impact": "Reduce security incidents by 40-60%"
            })
        
        # Performance recommendations
        low_uptime_cameras = [c for c in cameras if c.get('uptime', 100) < 90]
        if low_uptime_cameras:
            recommendations.append({
                "category": "performance",
                "priority": "medium",
                "title": "Camera Maintenance Required",
                "description": f"{len(low_uptime_cameras)} cameras have low uptime and need maintenance",
                "impact": "Improve system reliability by 15-25%"
            })
        
        return recommendations
    
    # Helper methods
    def _calculate_system_health_score(self, cameras: List[Dict], recordings: List[Dict], alerts: List[Dict]) -> float:
        """Calculate overall system health score"""
        if not cameras:
            return 0.0
        
        uptime_score = statistics.mean([c.get('uptime', 0) for c in cameras])
        alert_score = max(0, 100 - len(alerts) * 2)  # Reduce score for each alert
        recording_score = min(100, len(recordings) / 10)  # Score based on recording activity
        
        return (uptime_score * 0.5 + alert_score * 0.3 + recording_score * 0.2)
    
    def _calculate_security_score(self, alerts: List[Dict], motion_events: List[Dict] = None) -> float:
        """Calculate security score"""
        if not alerts:
            return 100.0
        
        critical_alerts = len([a for a in alerts if a.get('severity') == 'critical'])
        high_alerts = len([a for a in alerts if a.get('severity') == 'high'])
        
        # Reduce score based on alert severity
        score = 100.0 - (critical_alerts * 10) - (high_alerts * 5)
        return max(0.0, score)
    
    def _calculate_threat_level(self, alerts: List[Dict], motion_events: List[Dict] = None) -> str:
        """Calculate current threat level"""
        if not alerts:
            return "low"
        
        critical_alerts = len([a for a in alerts if a.get('severity') == 'critical'])
        high_alerts = len([a for a in alerts if a.get('severity') == 'high'])
        
        if critical_alerts > 5:
            return "critical"
        elif critical_alerts > 2 or high_alerts > 10:
            return "high"
        elif high_alerts > 5:
            return "medium"
        else:
            return "low"
    
    def _calculate_operational_efficiency(self, cameras: List[Dict], recordings: List[Dict]) -> float:
        """Calculate operational efficiency score"""
        if not cameras:
            return 0.0
        
        uptime_efficiency = statistics.mean([c.get('uptime', 0) for c in cameras])
        recording_efficiency = min(100, len(recordings) / len(cameras) * 10)
        
        return (uptime_efficiency * 0.7 + recording_efficiency * 0.3)
    
    def _calculate_percentage_change(self, old_value: int, new_value: int) -> float:
        """Calculate percentage change between two values"""
        if old_value == 0:
            return 100.0 if new_value > 0 else 0.0
        return ((new_value - old_value) / old_value) * 100
    
    def _find_peak_hours(self, recordings: List[Dict]) -> List[int]:
        """Find peak recording hours"""
        hours = []
        for recording in recordings:
            try:
                timestamp = datetime.fromisoformat(recording.get('start_time', '').replace('Z', '+00:00'))
                hours.append(timestamp.hour)
            except:
                continue
        
        if not hours:
            return []
        
        # Find most common hours
        hour_counts = {}
        for hour in hours:
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        # Return top 3 peak hours
        sorted_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)
        return [hour for hour, count in sorted_hours[:3]]
    
    def _analyze_alert_patterns(self, alerts: List[Dict]) -> Dict[str, Any]:
        """Analyze patterns in alerts"""
        if not alerts:
            return {}
        
        # Group alerts by hour
        hourly_patterns = {}
        for alert in alerts:
            try:
                timestamp = datetime.fromisoformat(alert.get('timestamp', '').replace('Z', '+00:00'))
                hour = timestamp.hour
                hourly_patterns[hour] = hourly_patterns.get(hour, 0) + 1
            except:
                continue
        
        return {
            "peak_hours": sorted(hourly_patterns.items(), key=lambda x: x[1], reverse=True)[:3],
            "alert_frequency": len(alerts) / 30  # per day assuming 30 days
        }
    
    def _predict_storage_usage(self, recordings: List[Dict], days: int) -> float:
        """Predict storage usage for given number of days"""
        if not recordings:
            return 0.0
        
        daily_storage = sum(r.get('file_size', 0) for r in recordings) / 30  # Assuming 30 days of data
        return daily_storage * days / (1024**3)  # Convert to GB
    
    def _predict_alert_volume(self, alerts: List[Dict], days: int) -> int:
        """Predict alert volume for given number of days"""
        if not alerts:
            return 0
        
        daily_alerts = len(alerts) / 30  # Assuming 30 days of data
        return int(daily_alerts * days)
    
    def _identify_high_risk_periods(self, alerts: List[Dict]) -> List[Dict[str, Any]]:
        """Identify high-risk time periods"""
        if not alerts:
            return []
        
        # Simple analysis - in production, use more sophisticated ML
        return [
            {"period": "Night (10 PM - 6 AM)", "risk_level": "high", "reason": "Most incidents occur during night hours"},
            {"period": "Weekends", "risk_level": "medium", "reason": "Reduced staff presence"}
        ]
    
    def _suggest_preventive_measures(self, alerts: List[Dict]) -> List[str]:
        """Suggest preventive measures based on alert patterns"""
        measures = []
        
        if len([a for a in alerts if a.get('type') == 'unauthorized']) > 5:
            measures.append("Implement additional access control measures")
        
        if len([a for a in alerts if a.get('type') == 'motion']) > 20:
            measures.append("Review motion detection sensitivity settings")
        
        return measures
    
    def _predict_maintenance_needs(self, recordings: List[Dict]) -> List[str]:
        """Predict maintenance needs"""
        # Simple prediction - in production, use ML models
        return ["Camera 1 needs lens cleaning", "Camera 2 requires firmware update"]
    
    def _generate_maintenance_schedule(self, recordings: List[Dict]) -> Dict[str, Any]:
        """Generate optimal maintenance schedule"""
        return {
            "weekly": ["Camera health checks", "System performance review"],
            "monthly": ["Deep cleaning of camera lenses", "Storage optimization"],
            "quarterly": ["Firmware updates", "Security audit"]
        }
    
    def _identify_cost_savings(self, recordings: List[Dict]) -> List[str]:
        """Identify cost saving opportunities"""
        savings = []
        
        total_storage = sum(r.get('file_size', 0) for r in recordings)
        if total_storage > 50 * (1024**3):  # 50 GB
            savings.append("Implement video compression to reduce storage costs by 40%")
        
        savings.append("Optimize retention policies to reduce storage by 25%")
        
        return savings
    
    def _generate_storage_recommendations(self, recordings: List[Dict]) -> List[str]:
        """Generate storage optimization recommendations"""
        recommendations = []
        
        total_storage = sum(r.get('file_size', 0) for r in recordings)
        if total_storage > 100 * (1024**3):  # 100 GB
            recommendations.append("Consider cloud storage for long-term retention")
            recommendations.append("Implement tiered storage strategy")
        
        recommendations.append("Enable video compression for non-critical recordings")
        
        return recommendations

# Global instance
analytics_service = AdvancedAnalyticsService() 