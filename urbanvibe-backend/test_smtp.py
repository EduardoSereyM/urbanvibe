
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email Configuration
SMTP_SERVER = "mail.urbanvibe.cl"
SMTP_PORT = 465
SMTP_USERNAME = "contacto@urbanvibe.cl"
SMTP_PASSWORD = "Abb1582esm.ComUV"

def test_email():
    print(f"Testing SMTP connection to {SMTP_SERVER}:{SMTP_PORT}...")
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = "contacto@urbanvibe.cl" # Send to self
        msg['Subject'] = "SMTP Test from UrbanVibe Backend"
        msg.attach(MIMEText("This is a test email to verify SMTP credentials.", 'plain'))

        print("Attempting to connect...")
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            print("Connected. Logging in...")
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            print("Logged in. Sending message...")
            server.send_message(msg)
            print("Message sent successfully!")
            
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_email()
