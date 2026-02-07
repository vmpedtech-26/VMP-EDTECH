import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the parent directory to sys.path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.email_service import email_service

async def main():
    load_dotenv()
    
    print("="*60)
    print("📧 VMP EdTech - Email Verification Script")
    print("="*60)
    
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    
    print(f"Configuration:")
    print(f"Host: {smtp_host}")
    print(f"User: {smtp_user}")
    print(f"Password: {'*' * len(smtp_pass) if smtp_pass else 'NOT SET'}")
    
    if not smtp_pass or smtp_pass == "CHANGE_ME_TO_REAL_PASSWORD":
        print("\n❌ Error: SMTP_PASSWORD is not set correctly in .env")
        print("Please update apps/api/.env with the correct password.")
        return

    recipient = input("\nEnter recipient email address: ")
    if not recipient:
        print("No email provided. Exiting.")
        return

    print(f"\nSending test email to {recipient}...")
    
    try:
        success = await email_service.send_email(
            to_email=recipient,
            subject="Test Email from VMP EdTech",
            html_content="<h1>It Works!</h1><p>This is a test email from the VMP EdTech platform verifying Hostinger SMTP configuration.</p>"
        )
        
        if success:
            print("\n✅ Email sent successfully!")
        else:
            print("\n❌ Failed to send email. Check logs for details.")
            
    except Exception as e:
        print(f"\n❌ Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
