import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List, Dict, Any
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape
import os
from app.config import settings
from app.database import SessionLocal
from app.models import EmailLog
import logging

logger = logging.getLogger(__name__)

# Get the templates directory
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "emails")

# Initialize Jinja2 environment
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)


class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.from_email = settings.email_from
        self.from_name = settings.email_from_name
        self.app_name = settings.app_name
        self.app_url = settings.app_url

    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        email_type: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using SMTP"""
        db = SessionLocal()
        email_log = None

        try:
            # Create email log
            email_log = EmailLog(
                recipient_email=to_email,
                email_type=email_type,
                subject=subject,
                status="pending"
            )
            db.add(email_log)
            db.commit()

            # Check if SMTP is configured
            if not self.smtp_user or not self.smtp_password:
                logger.warning(f"SMTP not configured. Email would be sent to: {to_email}")
                logger.info(f"Subject: {subject}")
                logger.info(f"Content preview: {html_content[:200]}...")
                email_log.status = "skipped"
                email_log.error_message = "SMTP not configured"
                db.commit()
                return True  # Return True for development

            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Add text part (fallback)
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)

            # Add HTML part
            part2 = MIMEText(html_content, "html")
            message.attach(part2)

            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, message.as_string())

            # Update log
            email_log.status = "sent"
            email_log.sent_at = datetime.utcnow()
            db.commit()

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            if email_log:
                email_log.status = "failed"
                email_log.error_message = str(e)
                db.commit()
            return False

        finally:
            db.close()

    def _render_template(self, template_name: str, **context) -> str:
        """Render an email template with context"""
        # Add common context
        context.update({
            "app_name": self.app_name,
            "app_url": self.app_url,
            "current_year": datetime.now().year
        })

        try:
            template = env.get_template(template_name)
            return template.render(**context)
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {str(e)}")
            # Return a basic fallback
            return f"<html><body><p>{context.get('message', 'Email content')}</p></body></html>"

    # ========================================
    # ORDER EMAILS
    # ========================================

    def send_order_confirmation(self, order, user) -> bool:
        """Send order confirmation email"""
        html_content = self._render_template(
            "order_confirmation.html",
            user=user,
            order=order,
            items=order.items
        )

        return self._send_email(
            to_email=user.email,
            subject=f"Order Confirmed - {order.order_number}",
            html_content=html_content,
            email_type="order_confirmation"
        )

    def send_order_shipped(self, order, user, tracking_info: Dict[str, Any] = None) -> bool:
        """Send order shipped notification"""
        html_content = self._render_template(
            "order_shipped.html",
            user=user,
            order=order,
            tracking_info=tracking_info
        )

        return self._send_email(
            to_email=user.email,
            subject=f"Your Order Has Been Shipped - {order.order_number}",
            html_content=html_content,
            email_type="order_shipped"
        )

    def send_order_delivered(self, order, user) -> bool:
        """Send order delivered notification"""
        html_content = self._render_template(
            "order_delivered.html",
            user=user,
            order=order
        )

        return self._send_email(
            to_email=user.email,
            subject=f"Your Order Has Been Delivered - {order.order_number}",
            html_content=html_content,
            email_type="order_delivered"
        )

    # ========================================
    # AUTH EMAILS
    # ========================================

    def send_welcome_email(self, user) -> bool:
        """Send welcome email to new user"""
        html_content = self._render_template(
            "welcome.html",
            user=user
        )

        return self._send_email(
            to_email=user.email,
            subject=f"Welcome to {self.app_name}!",
            html_content=html_content,
            email_type="welcome"
        )

    def send_password_reset(self, user, reset_token: str) -> bool:
        """Send password reset email"""
        reset_link = f"{self.app_url}/reset-password?token={reset_token}"

        html_content = self._render_template(
            "password_reset.html",
            user=user,
            reset_link=reset_link
        )

        return self._send_email(
            to_email=user.email,
            subject=f"Reset Your Password - {self.app_name}",
            html_content=html_content,
            email_type="password_reset"
        )

    # ========================================
    # STOCK NOTIFICATION
    # ========================================

    def send_stock_alert(self, email: str, product, user_name: Optional[str] = None) -> bool:
        """Send back-in-stock notification"""
        html_content = self._render_template(
            "stock_alert.html",
            user_name=user_name or "Valued Customer",
            product=product,
            product_url=f"{self.app_url}/product/{product.slug}"
        )

        return self._send_email(
            to_email=email,
            subject=f"Back in Stock: {product.name}",
            html_content=html_content,
            email_type="stock_alert"
        )

    # ========================================
    # GIFT CARDS
    # ========================================

    def send_gift_card(self, gift_card, sender_name: str) -> bool:
        """Send gift card email to recipient"""
        html_content = self._render_template(
            "gift_card.html",
            gift_card=gift_card,
            sender_name=sender_name,
            redeem_url=f"{self.app_url}/gift-cards/redeem?code={gift_card.code}"
        )

        return self._send_email(
            to_email=gift_card.recipient_email,
            subject=f"You've Received a Gift Card from {sender_name}!",
            html_content=html_content,
            email_type="gift_card"
        )

    # ========================================
    # REFERRAL
    # ========================================

    def send_referral_invite(self, referrer_name: str, referrer_email: str, invite_email: str, referral_code: str) -> bool:
        """Send referral invite email"""
        html_content = self._render_template(
            "referral_invite.html",
            referrer_name=referrer_name,
            referral_code=referral_code,
            signup_url=f"{self.app_url}/register?ref={referral_code}"
        )

        return self._send_email(
            to_email=invite_email,
            subject=f"{referrer_name} invited you to {self.app_name}!",
            html_content=html_content,
            email_type="referral_invite"
        )

    # ========================================
    # ABANDONED CART
    # ========================================

    def send_abandoned_cart_email(
        self,
        user,
        cart_items: List[Dict],
        cart_total: float,
        sequence: int = 1,
        discount_code: Optional[str] = None
    ) -> bool:
        """Send abandoned cart reminder"""
        subject_options = {
            1: "You left something behind!",
            2: "Still thinking about it?",
            3: f"Last chance! Here's 10% off your cart"
        }

        html_content = self._render_template(
            f"abandoned_cart_{sequence}.html",
            user=user,
            cart_items=cart_items,
            cart_total=cart_total,
            discount_code=discount_code,
            cart_url=f"{self.app_url}/cart"
        )

        return self._send_email(
            to_email=user.email,
            subject=subject_options.get(sequence, "Complete your purchase"),
            html_content=html_content,
            email_type=f"abandoned_cart_{sequence}"
        )

    # ========================================
    # NEWSLETTER
    # ========================================

    def send_newsletter_confirmation(self, email: str, name: Optional[str] = None) -> bool:
        """Send newsletter subscription confirmation"""
        html_content = self._render_template(
            "newsletter_confirmation.html",
            name=name or "there",
            unsubscribe_url=f"{self.app_url}/unsubscribe?email={email}"
        )

        return self._send_email(
            to_email=email,
            subject=f"Welcome to {self.app_name} Newsletter!",
            html_content=html_content,
            email_type="newsletter_confirmation"
        )

    # ========================================
    # CONTACT FORM
    # ========================================

    def send_contact_form_email(
        self,
        name: str,
        email: str,
        subject: str,
        message: str
    ) -> bool:
        """Send contact form submission to support"""
        html_content = self._render_template(
            "contact_form.html",
            sender_name=name,
            sender_email=email,
            subject=subject,
            message=message,
            submitted_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        # Send to support email
        support_email = self.from_email  # Or configure a separate support email

        return self._send_email(
            to_email=support_email,
            subject=f"Contact Form: {subject}",
            html_content=html_content,
            email_type="contact_form"
        )

    def send_contact_form_confirmation(self, name: str, email: str) -> bool:
        """Send confirmation to user that their message was received"""
        html_content = self._render_template(
            "contact_form_confirmation.html",
            name=name
        )

        return self._send_email(
            to_email=email,
            subject=f"We received your message - {self.app_name}",
            html_content=html_content,
            email_type="contact_form_confirmation"
        )


# Singleton instance
email_service = EmailService()
