from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Float as SQLFloat
from datetime import datetime, timedelta
from typing import List, Dict
from app.database import get_db
from app.models import Metric, User
from app.schemas import MetricCreate, MetricResponse, MetricsDashboard, UptimeStatus
from app.auth import get_current_user

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

# Store metrics endpoint
@router.post("/", response_model=dict)
async def store_metric(
    metric: MetricCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Store a metric in the database
    """
    try:
        new_metric = Metric(
            user_id=current_user.user_id,
            type=metric.type,
            data=metric.data,
            created_at=datetime.utcnow()
        )
        
        db.add(new_metric)
        db.commit()
        db.refresh(new_metric)
        
        return {"success": True, "metric_id": new_metric.metric_id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store metric: {str(e)}")

# Public endpoint for storing metrics (no auth required for better reliability)
@router.post("/public", response_model=dict)
async def store_metric_public(
    metric: MetricCreate, 
    db: Session = Depends(get_db)
):
    """
    Store a metric without authentication (for page loads, errors before login, etc.)
    """
    try:
        new_metric = Metric(
            user_id=None,  # No user associated
            type=metric.type,
            data=metric.data,
            created_at=datetime.utcnow()
        )
        
        db.add(new_metric)
        db.commit()
        db.refresh(new_metric)
        
        return {"success": True, "metric_id": new_metric.metric_id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store metric: {str(e)}")

# Get metrics dashboard
@router.get("/dashboard", response_model=MetricsDashboard)
async def get_metrics_dashboard(db: Session = Depends(get_db)):
    """
    Get aggregated metrics for dashboard
    """
    try:
        # Average page load time (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        page_load_metrics = db.query(Metric).filter(
            Metric.type == 'page_load',
            Metric.created_at > seven_days_ago
        ).all()
        
        avg_page_load = 0
        if page_load_metrics:
            durations = [float(m.data.get('duration', 0)) for m in page_load_metrics]
            avg_page_load = sum(durations) / len(durations) if durations else 0
        
        # Error rate (last hour)
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        error_count = db.query(func.count(Metric.metric_id)).filter(
            Metric.type == 'error',
            Metric.created_at > one_hour_ago
        ).scalar() or 0
        
        # Weekly active users (count distinct user_ids)
        active_users_count = db.query(func.count(func.distinct(Metric.user_id))).filter(
            Metric.type == 'user_activity',
            Metric.created_at > seven_days_ago,
            Metric.user_id.isnot(None)
        ).scalar() or 0
        
        # Average satisfaction (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        satisfaction_metrics = db.query(Metric).filter(
            Metric.type == 'satisfaction',
            Metric.created_at > thirty_days_ago
        ).all()
        
        avg_satisfaction = 0
        if satisfaction_metrics:
            ratings = [float(m.data.get('rating', 0)) for m in satisfaction_metrics]
            avg_satisfaction = sum(ratings) / len(ratings) if ratings else 0
        
        # Average latency by action (last 24 hours)
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        latency_metrics = db.query(Metric).filter(
            Metric.type == 'latency',
            Metric.created_at > twenty_four_hours_ago
        ).all()
        
        latency_by_action = {}
        for metric in latency_metrics:
            action = metric.data.get('action')
            duration = float(metric.data.get('duration', 0))
            if action not in latency_by_action:
                latency_by_action[action] = []
            latency_by_action[action].append(duration)
        
        avg_latency = {
            action: round(sum(durations) / len(durations), 2)
            for action, durations in latency_by_action.items()
        }
        
        return MetricsDashboard(
            avgPageLoad=round(avg_page_load, 2),
            errorRate=error_count,
            weeklyActiveUsers=active_users_count,
            avgSatisfaction=round(avg_satisfaction, 2),
            avgLatency=avg_latency,
            period={
                "pageLoad": "7 days",
                "errors": "1 hour",
                "users": "7 days",
                "satisfaction": "30 days",
                "latency": "24 hours"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}")

# Get detailed metrics by type
@router.get("/{metric_type}", response_model=Dict)
async def get_metrics_by_type(
    metric_type: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Get detailed metrics filtered by type and time period
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        metrics = db.query(Metric).filter(
            Metric.type == metric_type,
            Metric.created_at > start_date
        ).order_by(Metric.created_at.desc()).limit(1000).all()
        
        return {
            "type": metric_type,
            "count": len(metrics),
            "period_days": days,
            "metrics": [
                {
                    "metric_id": m.metric_id,
                    "data": m.data,
                    "created_at": m.created_at.isoformat()
                }
                for m in metrics
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}")

# Get uptime status
@router.get("/uptime/status", response_model=UptimeStatus)
async def get_uptime_status(db: Session = Depends(get_db)):
    """
    Calculate uptime percentage based on error logs
    """
    try:
        # Last 24 hours
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        
        # Count successful requests (page loads + successful API calls)
        total_requests = db.query(func.count(Metric.metric_id)).filter(
            Metric.type.in_(['page_load', 'latency']),
            Metric.created_at > twenty_four_hours_ago
        ).scalar() or 0
        
        # Count failed requests
        failed_requests = db.query(func.count(Metric.metric_id)).filter(
            Metric.type == 'error',
            Metric.created_at > twenty_four_hours_ago
        ).scalar() or 0
        
        uptime_percentage = 100.0
        if total_requests > 0:
            uptime_percentage = ((total_requests - failed_requests) / total_requests) * 100
        
        return UptimeStatus(
            uptime_percentage=round(uptime_percentage, 2),
            total_requests=total_requests,
            failed_requests=failed_requests,
            period="24 hours"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate uptime: {str(e)}")

# Get user-specific metrics
@router.get("/user/activity", response_model=Dict)
async def get_user_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get metrics for the current user
    """
    try:
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        # Count user's actions
        user_metrics = db.query(Metric).filter(
            Metric.user_id == current_user.user_id,
            Metric.created_at > seven_days_ago
        ).all()
        
        # Group by type
        metrics_by_type = {}
        for metric in user_metrics:
            if metric.type not in metrics_by_type:
                metrics_by_type[metric.type] = 0
            metrics_by_type[metric.type] += 1
        
        return {
            "user_id": current_user.user_id,
            "email": current_user.email,
            "period": "7 days",
            "total_actions": len(user_metrics),
            "actions_by_type": metrics_by_type
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user metrics: {str(e)}")