from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, distinct
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import re

from app.database import get_db
from app.models.models import PageView, VisitorSession, User
from app.utils.auth import get_current_admin
from app.schemas.schemas import (
    PageViewCreate, VisitorAnalyticsResponse, VisitorAnalyticsSummary,
    TrafficSourceBreakdown, GeographicBreakdown, DeviceBreakdown,
    BrowserBreakdown, PageBreakdown, VisitorTrendPoint, RealTimeVisitors
)

router = APIRouter(prefix="/visitor-analytics", tags=["Visitor Analytics"])


# ============ Helper Functions ============

def get_visitor_hash(ip: str, user_agent: str, date: str) -> str:
    """Create anonymized visitor hash (rotates daily for privacy)"""
    raw = f"{ip}:{user_agent}:{date}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def parse_user_agent(user_agent: str) -> dict:
    """Parse user agent string to extract device/browser info"""
    result = {
        "device_type": "desktop",
        "browser": "Unknown",
        "os": "Unknown"
    }

    ua = user_agent.lower()

    # Device type
    if "mobile" in ua or ("android" in ua and "mobile" in ua):
        result["device_type"] = "mobile"
    elif "tablet" in ua or "ipad" in ua:
        result["device_type"] = "tablet"

    # Browser detection
    if "chrome" in ua and "edg" not in ua and "opr" not in ua:
        result["browser"] = "Chrome"
    elif "firefox" in ua:
        result["browser"] = "Firefox"
    elif "safari" in ua and "chrome" not in ua:
        result["browser"] = "Safari"
    elif "edg" in ua:
        result["browser"] = "Edge"
    elif "opera" in ua or "opr" in ua:
        result["browser"] = "Opera"

    # OS detection
    if "windows" in ua:
        result["os"] = "Windows"
    elif "mac os" in ua or "macos" in ua:
        result["os"] = "macOS"
    elif "linux" in ua and "android" not in ua:
        result["os"] = "Linux"
    elif "android" in ua:
        result["os"] = "Android"
    elif "iphone" in ua or "ipad" in ua:
        result["os"] = "iOS"

    return result


def parse_traffic_source(referrer: str, utm_source: str = None) -> tuple:
    """Determine traffic source from referrer URL"""
    if utm_source:
        return utm_source, "utm"

    if not referrer:
        return "direct", None

    referrer_lower = referrer.lower()

    # Extract domain
    domain_match = re.search(r'https?://([^/]+)', referrer_lower)
    domain = domain_match.group(1) if domain_match else ""

    # Social media
    social_domains = ['facebook.com', 'fb.com', 'twitter.com', 't.co',
                      'instagram.com', 'linkedin.com', 'pinterest.com',
                      'youtube.com', 'tiktok.com', 'reddit.com']
    for social in social_domains:
        if social in domain:
            return "social", domain

    # Search engines
    search_domains = ['google.', 'bing.com', 'yahoo.', 'duckduckgo.com',
                      'baidu.com', 'yandex.']
    for search in search_domains:
        if search in domain:
            return "organic_search", domain

    # Email providers (likely email campaign)
    email_domains = ['mail.google.com', 'outlook.', 'mail.yahoo.']
    for email in email_domains:
        if email in domain:
            return "email", domain

    return "referral", domain


# ============ Public Tracking Endpoint ============

@router.post("/track")
async def track_page_view(
    data: PageViewCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Track a page view - called from frontend.
    Privacy-conscious: no personal data, hashed identifiers, minimal data retention.
    Deduplicates page refreshes - only counts actual navigation.
    """
    # Get client IP (check for proxies)
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.headers.get("x-real-ip", "")
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"

    user_agent = request.headers.get("user-agent", "")

    # Create anonymized visitor hash based on IP (rotates daily for privacy)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    visitor_hash = get_visitor_hash(client_ip, user_agent, today)

    # Get session ID from header
    session_id = request.headers.get("x-session-id")
    if not session_id:
        session_id = hashlib.sha256(f"{visitor_hash}:{datetime.utcnow().timestamp()}".encode()).hexdigest()[:32]

    page_path = data.page_path[:500] if data.page_path else "/"

    # DEDUPLICATION: Check if same visitor viewed same page in last 30 seconds
    thirty_seconds_ago = datetime.utcnow() - timedelta(seconds=30)
    recent_view = db.query(PageView).filter(
        and_(
            PageView.session_id == session_id,
            PageView.page_path == page_path,
            PageView.created_at >= thirty_seconds_ago
        )
    ).first()

    if recent_view:
        # Same page viewed recently - this is a refresh, don't count it
        return {"status": "deduplicated", "session_id": session_id}

    # Parse user agent
    device_info = parse_user_agent(user_agent)

    # Parse traffic source
    traffic_source, referrer_domain = parse_traffic_source(data.referrer, data.utm_source)

    # Create page view record
    page_view = PageView(
        visitor_hash=visitor_hash,
        session_id=session_id,
        page_path=page_path,
        page_title=data.page_title[:255] if data.page_title else None,
        traffic_source=traffic_source,
        referrer_url=data.referrer[:500] if data.referrer else None,
        referrer_domain=referrer_domain,
        utm_source=data.utm_source,
        utm_medium=data.utm_medium,
        utm_campaign=data.utm_campaign,
        country_code="BD",  # Default - integrate with IP geolocation service for real data
        country_name="Bangladesh",
        city="Dhaka",
        device_type=device_info["device_type"],
        browser=device_info["browser"],
        os=device_info["os"],
        screen_width=data.screen_width,
        screen_height=data.screen_height
    )

    db.add(page_view)

    # Update or create session
    existing_session = db.query(VisitorSession).filter(
        VisitorSession.session_id == session_id
    ).first()

    if existing_session:
        existing_session.page_count += 1
        existing_session.exit_page = page_path
        existing_session.last_activity = datetime.utcnow()
        # Calculate session duration
        if existing_session.started_at:
            existing_session.duration_seconds = int(
                (datetime.utcnow() - existing_session.started_at.replace(tzinfo=None)).total_seconds()
            )
    else:
        new_session = VisitorSession(
            session_id=session_id,
            visitor_hash=visitor_hash,
            entry_page=page_path,
            exit_page=page_path,
            traffic_source=traffic_source,
            referrer_domain=referrer_domain,
            country_code="BD",
            city="Dhaka",
            device_type=device_info["device_type"],
            browser=device_info["browser"],
            os=device_info["os"]
        )
        db.add(new_session)

    db.commit()

    return {"status": "tracked", "session_id": session_id}


# ============ Admin Analytics Endpoints ============

@router.get("/stats", response_model=VisitorAnalyticsResponse)
async def get_visitor_analytics(
    period: str = "7d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get comprehensive visitor analytics for admin dashboard"""

    # Calculate date range
    now = datetime.utcnow()
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 7)
    start_date = now - timedelta(days=days)
    prev_start = start_date - timedelta(days=days)

    # Current period metrics
    current_views = db.query(func.count(PageView.id)).filter(
        PageView.created_at >= start_date
    ).scalar() or 0

    current_visitors = db.query(func.count(distinct(PageView.visitor_hash))).filter(
        PageView.created_at >= start_date
    ).scalar() or 0

    current_sessions = db.query(func.count(distinct(PageView.session_id))).filter(
        PageView.created_at >= start_date
    ).scalar() or 0

    # Previous period metrics (for comparison)
    prev_views = db.query(func.count(PageView.id)).filter(
        and_(PageView.created_at >= prev_start, PageView.created_at < start_date)
    ).scalar() or 0

    prev_visitors = db.query(func.count(distinct(PageView.visitor_hash))).filter(
        and_(PageView.created_at >= prev_start, PageView.created_at < start_date)
    ).scalar() or 0

    prev_sessions = db.query(func.count(distinct(PageView.session_id))).filter(
        and_(PageView.created_at >= prev_start, PageView.created_at < start_date)
    ).scalar() or 0

    # Calculate changes
    def calc_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    # Session metrics
    sessions = db.query(VisitorSession).filter(
        VisitorSession.started_at >= start_date
    ).all()

    avg_duration = 0
    avg_pages = 0
    bounce_count = 0

    if sessions:
        total_duration = sum(s.duration_seconds or 0 for s in sessions)
        total_pages = sum(s.page_count for s in sessions)
        bounce_count = sum(1 for s in sessions if s.page_count == 1)
        avg_duration = total_duration / len(sessions)
        avg_pages = total_pages / len(sessions)

    bounce_rate = (bounce_count / len(sessions) * 100) if sessions else 0

    summary = VisitorAnalyticsSummary(
        total_page_views=current_views,
        unique_visitors=current_visitors,
        total_sessions=current_sessions,
        avg_session_duration=round(avg_duration, 1),
        avg_pages_per_session=round(avg_pages, 1),
        bounce_rate=round(bounce_rate, 1),
        page_views_change=calc_change(current_views, prev_views),
        visitors_change=calc_change(current_visitors, prev_visitors),
        sessions_change=calc_change(current_sessions, prev_sessions)
    )

    # Traffic sources breakdown
    traffic_query = db.query(
        PageView.traffic_source,
        func.count(PageView.id).label('count')
    ).filter(PageView.created_at >= start_date)\
     .group_by(PageView.traffic_source)\
     .order_by(func.count(PageView.id).desc()).all()

    total_traffic = sum(t.count for t in traffic_query) or 1
    traffic_sources = [
        TrafficSourceBreakdown(
            source=t.traffic_source or "direct",
            count=t.count,
            percentage=round(t.count / total_traffic * 100, 1)
        )
        for t in traffic_query
    ]

    # Geographic breakdown
    geo_query = db.query(
        PageView.country_code,
        PageView.country_name,
        func.count(distinct(PageView.visitor_hash)).label('count')
    ).filter(
        and_(PageView.created_at >= start_date, PageView.country_code.isnot(None))
    ).group_by(PageView.country_code, PageView.country_name)\
     .order_by(func.count(distinct(PageView.visitor_hash)).desc())\
     .limit(10).all()

    total_geo = sum(g.count for g in geo_query) or 1
    geographic = [
        GeographicBreakdown(
            country_code=g.country_code or "XX",
            country_name=g.country_name or "Unknown",
            count=g.count,
            percentage=round(g.count / total_geo * 100, 1)
        )
        for g in geo_query
    ]

    # Device breakdown
    device_query = db.query(
        PageView.device_type,
        func.count(distinct(PageView.visitor_hash)).label('count')
    ).filter(PageView.created_at >= start_date)\
     .group_by(PageView.device_type)\
     .order_by(func.count(distinct(PageView.visitor_hash)).desc()).all()

    total_devices = sum(d.count for d in device_query) or 1
    devices = [
        DeviceBreakdown(
            device_type=d.device_type or "unknown",
            count=d.count,
            percentage=round(d.count / total_devices * 100, 1)
        )
        for d in device_query
    ]

    # Browser breakdown
    browser_query = db.query(
        PageView.browser,
        func.count(distinct(PageView.visitor_hash)).label('count')
    ).filter(PageView.created_at >= start_date)\
     .group_by(PageView.browser)\
     .order_by(func.count(distinct(PageView.visitor_hash)).desc())\
     .limit(5).all()

    total_browsers = sum(b.count for b in browser_query) or 1
    browsers = [
        BrowserBreakdown(
            browser=b.browser or "Unknown",
            count=b.count,
            percentage=round(b.count / total_browsers * 100, 1)
        )
        for b in browser_query
    ]

    # Top pages
    pages_query = db.query(
        PageView.page_path,
        func.count(PageView.id).label('views'),
        func.count(distinct(PageView.visitor_hash)).label('unique_visitors')
    ).filter(PageView.created_at >= start_date)\
     .group_by(PageView.page_path)\
     .order_by(func.count(PageView.id).desc())\
     .limit(10).all()

    top_pages = [
        PageBreakdown(
            page_path=p.page_path,
            views=p.views,
            unique_visitors=p.unique_visitors
        )
        for p in pages_query
    ]

    # Daily trends
    trends_query = db.query(
        func.date(PageView.created_at).label('date'),
        func.count(PageView.id).label('views'),
        func.count(distinct(PageView.visitor_hash)).label('visitors'),
        func.count(distinct(PageView.session_id)).label('sessions')
    ).filter(PageView.created_at >= start_date)\
     .group_by(func.date(PageView.created_at))\
     .order_by(func.date(PageView.created_at)).all()

    trends = [
        VisitorTrendPoint(
            date=t.date.strftime("%b %d") if hasattr(t.date, 'strftime') else str(t.date),
            page_views=t.views,
            unique_visitors=t.visitors,
            sessions=t.sessions
        )
        for t in trends_query
    ]

    return VisitorAnalyticsResponse(
        summary=summary,
        traffic_sources=traffic_sources,
        geographic=geographic,
        devices=devices,
        browsers=browsers,
        top_pages=top_pages,
        trends=trends
    )


@router.get("/real-time", response_model=RealTimeVisitors)
async def get_real_time_visitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get real-time active visitors (last 5 minutes)"""

    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)

    active_visitors = db.query(func.count(distinct(PageView.visitor_hash))).filter(
        PageView.created_at >= five_minutes_ago
    ).scalar() or 0

    active_sessions = db.query(func.count(distinct(PageView.session_id))).filter(
        PageView.created_at >= five_minutes_ago
    ).scalar() or 0

    # Top active pages
    top_pages_query = db.query(
        PageView.page_path,
        func.count(PageView.id).label('count')
    ).filter(PageView.created_at >= five_minutes_ago)\
     .group_by(PageView.page_path)\
     .order_by(func.count(PageView.id).desc())\
     .limit(5).all()

    return RealTimeVisitors(
        active_visitors=active_visitors,
        active_sessions=active_sessions,
        top_pages=[{"path": p.page_path, "count": p.count} for p in top_pages_query]
    )


@router.post("/generate-sample-data")
async def generate_sample_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Generate sample analytics data for testing"""
    import random

    pages = ["/", "/products", "/products/electronics", "/products/fashion",
             "/product/iphone-15", "/product/samsung-tv", "/cart", "/checkout",
             "/wishlist", "/profile", "/orders"]

    traffic_sources = ["direct", "organic_search", "social", "referral", "email"]
    countries = [
        ("BD", "Bangladesh", "Dhaka"),
        ("US", "United States", "New York"),
        ("IN", "India", "Mumbai"),
        ("GB", "United Kingdom", "London"),
        ("CA", "Canada", "Toronto"),
        ("AU", "Australia", "Sydney"),
    ]
    devices = ["desktop", "mobile", "tablet"]
    browsers = ["Chrome", "Safari", "Firefox", "Edge", "Opera"]
    oses = ["Windows", "macOS", "iOS", "Android", "Linux"]

    now = datetime.utcnow()
    records_created = 0

    # Generate data for the last 30 days
    for day_offset in range(30):
        date = now - timedelta(days=day_offset)
        daily_visitors = random.randint(20, 100)

        for _ in range(daily_visitors):
            visitor_hash = hashlib.sha256(f"sample_{random.randint(1, 1000)}_{date.date()}".encode()).hexdigest()[:32]
            session_id = hashlib.sha256(f"session_{random.randint(1, 10000)}".encode()).hexdigest()[:32]
            country = random.choice(countries)
            pages_viewed = random.randint(1, 8)

            # Create session
            session = VisitorSession(
                session_id=session_id,
                visitor_hash=visitor_hash,
                entry_page=random.choice(pages),
                exit_page=random.choice(pages),
                page_count=pages_viewed,
                traffic_source=random.choice(traffic_sources),
                country_code=country[0],
                city=country[2],
                device_type=random.choice(devices),
                browser=random.choice(browsers),
                os=random.choice(oses),
                started_at=date,
                last_activity=date + timedelta(minutes=random.randint(1, 30)),
                duration_seconds=random.randint(30, 600)
            )

            # Check if session exists
            existing = db.query(VisitorSession).filter(VisitorSession.session_id == session_id).first()
            if not existing:
                db.add(session)

            # Create page views for this session
            for i in range(pages_viewed):
                page_view = PageView(
                    visitor_hash=visitor_hash,
                    session_id=session_id,
                    page_path=random.choice(pages),
                    page_title=f"Page Title {i}",
                    traffic_source=random.choice(traffic_sources),
                    country_code=country[0],
                    country_name=country[1],
                    city=country[2],
                    device_type=random.choice(devices),
                    browser=random.choice(browsers),
                    os=random.choice(oses),
                    screen_width=random.choice([1920, 1366, 1440, 375, 414]),
                    screen_height=random.choice([1080, 768, 900, 812, 896]),
                    created_at=date + timedelta(minutes=i * random.randint(1, 5))
                )
                db.add(page_view)
                records_created += 1

    db.commit()

    return {"status": "success", "message": f"Generated {records_created} sample page views"}
