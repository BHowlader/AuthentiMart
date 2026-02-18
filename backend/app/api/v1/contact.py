from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.email import email_service

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactFormResponse(BaseModel):
    success: bool
    message: str


@router.post("", response_model=ContactFormResponse)
async def submit_contact_form(
    form_data: ContactFormRequest,
    background_tasks: BackgroundTasks
):
    """
    Submit a contact form message.
    Sends email to support and confirmation to user.
    """
    try:
        # Validate input lengths
        if len(form_data.name) < 2:
            raise HTTPException(status_code=400, detail="Name is too short")
        if len(form_data.message) < 10:
            raise HTTPException(status_code=400, detail="Message is too short")

        # Send emails in background to avoid blocking the response
        background_tasks.add_task(
            email_service.send_contact_form_email,
            name=form_data.name,
            email=form_data.email,
            subject=form_data.subject,
            message=form_data.message
        )

        background_tasks.add_task(
            email_service.send_contact_form_confirmation,
            name=form_data.name,
            email=form_data.email
        )

        return ContactFormResponse(
            success=True,
            message="Your message has been sent successfully. We'll get back to you soon!"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to send message. Please try again later."
        )
