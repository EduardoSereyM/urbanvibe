from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models.profiles import Profile
import os

router = APIRouter()

# Relaxed validation to avoid 422 errors hindering debugging
class ContactRequest(BaseModel):
    email: Optional[str] = None 
    name: Optional[str] = None
    message: str

# Email Configuration
try:
    SMTP_SERVER = os.getenv("SMTP_SERVER", "mail.urbanvibe.cl")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "contacto@urbanvibe.cl")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "Abb1582esm.ComUV")
except:
    # Safe defaults
    SMTP_SERVER = "mail.urbanvibe.cl"
    SMTP_PORT = 465
    SMTP_USERNAME = "contacto@urbanvibe.cl"
    SMTP_PASSWORD = "Abb1582esm.ComUV"

def send_email_task(subject: str, body: str, to_email: str):
    print(f"🔄 [BACKGROUND] Starting email task: {subject}", flush=True)
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        print(f"🔄 [BACKGROUND] Connecting to {SMTP_SERVER}:{SMTP_PORT}...", flush=True)
        
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                print("🔄 [BACKGROUND] Sending message (SSL)...", flush=True)
                server.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                print(f"🔄 [BACKGROUND] Sending message (TLS/STARTTLS)...", flush=True)
                server.send_message(msg)
                
        print("✅ [BACKGROUND] Email sent successfully!", flush=True)
            
    except Exception as e:
        print(f"❌ [BACKGROUND] Failed to send email: {e}", flush=True)

@router.post("/")
async def send_contact_email(
    request: ContactRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Optional[Profile] = Depends(deps.get_current_user_optional)
):
    print(f"🔥� [CONTACT] Request received. Data: name='{request.name}' email='{request.email}'", flush=True)
    
    sender_email = request.email or (current_user.email if current_user else None)
    sender_name = "Guest"

    if sender_email:
        sender_email = sender_email.lower().strip()
        print(f"🔍 [CONTACT] Looking up user with email: '{sender_email}'", flush=True)

    # 1. Try DB Lookup by Email (Highest Priority & Source of Truth)
    if sender_email:
        try:
            # CORRECT ASYNC QUERY
            query = select(Profile).where(Profile.email == sender_email)
            result = await db.execute(query)
            profile_db = result.scalars().first()
            
            if profile_db:
                print(f"✅ [CONTACT] Profile FOUND. Username: '{profile_db.username}'", flush=True)
                if profile_db.username:
                    sender_name = profile_db.username
                else:
                    print("⚠️ [CONTACT] Profile found but username is empty.", flush=True)
            else:
                print(f"❌ [CONTACT] Profile NOT FOUND for email: {sender_email}", flush=True)
                if request.name:
                    sender_name = request.name
                    
        except Exception as e:
            print(f"💥 [CONTACT] CRITICAL DB ERROR: {e}", flush=True)
            if request.name:
                sender_name = request.name
    
    # 2. Fallback to Frontend Name
    elif request.name:
        sender_name = request.name
        print(f"ℹ️ [CONTACT] No email, using frontend name: {sender_name}", flush=True)
        
    print(f"🏁 [CONTACT] FINAL Sender Name: {sender_name}", flush=True)

    if not sender_email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    subject = f"Nuevo mensaje de contacto de {sender_name}"
    body = f"""
    Nuevo mensaje recibido desde la App UrbanVibe:
    
    De: {sender_name} ({sender_email})
    
    Mensaje:
    {request.message}
    """
    
    try:
        # Send ONLY to admin support
        background_tasks.add_task(send_email_task, subject, body, SMTP_USERNAME)
    except Exception as e:
        print(f"❌ [CONTACT] Error scheduling task: {e}", flush=True)
        raise HTTPException(status_code=500, detail="Error interno")
    
    return {"message": "Mensaje enviado correctamente"}
