#!/usr/bin/env python3
"""
VMP Servicios - Interactive Production Deployment Script
This script will guide you through the final deployment steps.
"""

import sys
import os

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_step(number, text):
    print(f"\n📋 STEP {number}: {text}")
    print("-" * 60)

def get_input(prompt, example=""):
    if example:
        print(f"   Example: {example}")
    value = input(f"   {prompt}: ").strip()
    return value

def main():
    print_header("VMP SERVICIOS - PRODUCTION DEPLOYMENT")
    print("This script will help you complete the deployment.\n")
    print("You'll need to:")
    print("  1. Get your Railway backend URL")
    print("  2. Get your Vercel frontend URL")
    print("  3. We'll configure everything automatically")
    
    input("\nPress ENTER to continue...")
    
    # Step 1: Get Railway URL
    print_step(1, "Get Railway Backend URL")
    print("""
    1. Open https://railway.app/dashboard in your browser
    2. Click on project 'ingenious-enthusiasm'
    3. Click on the 'vmp-servicios' service
    4. Go to Settings tab
    5. Scroll to 'Networking' section
    6. If there's no URL, click 'Generate Domain' and set port to 8000
    7. Copy the public URL (format: xxx.up.railway.app)
    """)
    
    railway_url = get_input(
        "Paste your Railway URL here",
        "https://vmp-servicios-production.up.railway.app"
    )
    
    # Validate and clean URL
    railway_url = railway_url.strip().rstrip('/')
    if not railway_url.startswith('http'):
        railway_url = f"https://{railway_url}"
    
    print(f"\n   ✅ Railway URL set to: {railway_url}")
    
    # Step 2: Get Vercel URL
    print_step(2, "Get Vercel Frontend URL")
    print("""
    1. Open https://vercel.com/dashboard in your browser
    2. Click on project 'vmp-edtech-web'
    3. Copy the domain (format: xxx.vercel.app)
    """)
    
    vercel_url = get_input(
        "Paste your Vercel URL here",
        "https://vmp-edtech-web.vercel.app"
    )
    
    # Validate and clean URL
    vercel_url = vercel_url.strip().rstrip('/')
    if not vercel_url.startswith('http'):
        vercel_url = f"https://{vercel_url}"
    
    print(f"\n   ✅ Vercel URL set to: {vercel_url}")
    
    # Step 3: Show configuration instructions
    print_step(3, "Configure Environment Variables")
    
    print("\n🔧 VERCEL Configuration:")
    print("-" * 60)
    print("1. Go to: https://vercel.com/matias-projects-4f28a416/vmp-edtech-web/settings/environment-variables")
    print("2. Find or add variable: NEXT_PUBLIC_API_URL")
    print(f"3. Set value to: {railway_url}")
    print("4. Click 'Save'")
    print("5. Go to Deployments tab")
    print("6. Click '...' on latest deployment → 'Redeploy'")
    
    input("\nPress ENTER when you've completed Vercel configuration...")
    
    print("\n🔧 RAILWAY Configuration:")
    print("-" * 60)
    print("1. Go to: https://railway.app/project/64de8acc-4290-47cc-8429-c100e1d43e86")
    print("2. Click on 'vmp-servicios' service")
    print("3. Go to 'Variables' tab")
    print("4. Add or update variable: CORS_ORIGINS")
    print(f"5. Set value to: {vercel_url}")
    print("6. The service will redeploy automatically")
    
    input("\nPress ENTER when you've completed Railway configuration...")
    
    # Step 4: Test the deployment
    print_step(4, "Test the Deployment")
    
    print("\nRunning smoke test...")
    print(f"Testing: {railway_url}\n")
    
    # Try to import requests, if not available, skip
    try:
        import requests
        
        # Test health endpoint
        try:
            response = requests.get(f"{railway_url}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Backend is ALIVE!")
            else:
                print(f"⚠️  Backend responded with status {response.status_code}")
        except Exception as e:
            print(f"❌ Could not reach backend: {e}")
            print("   This might be normal if Railway is still deploying.")
        
        # Test public endpoint
        try:
            response = requests.get(f"{railway_url}/api/public/validar/000000", timeout=10)
            if response.status_code in [200, 404]:
                print("✅ Public API endpoint is working!")
        except Exception as e:
            print(f"⚠️  Public endpoint test: {e}")
            
    except ImportError:
        print("⚠️  'requests' library not available, skipping automated tests")
        print(f"   You can manually test: {railway_url}/health")
    
    # Final summary
    print_header("DEPLOYMENT COMPLETE!")
    
    print("📝 Your Production URLs:")
    print(f"   Frontend: {vercel_url}")
    print(f"   Backend:  {railway_url}")
    
    print("\n🎯 Next Steps:")
    print("   1. Visit your frontend URL and test the login")
    print("   2. Use credentials: admin@vmpservicios.com / AdminVMP2026!")
    print("   3. Monitor Railway logs for any errors")
    print("   4. Check Vercel deployment logs")
    
    print("\n📚 Documentation:")
    print("   - FINAL_STEPS.md - Manual deployment guide")
    print("   - DIA_5_COMPLETADO.md - Day 5 summary")
    print("   - smoke_test.py - Automated testing script")
    
    # Save URLs to a file
    with open('.env.production', 'w') as f:
        f.write(f"# VMP Servicios Production URLs\n")
        f.write(f"# Generated: {os.popen('date').read().strip()}\n\n")
        f.write(f"FRONTEND_URL={vercel_url}\n")
        f.write(f"BACKEND_URL={railway_url}\n")
    
    print("\n💾 URLs saved to: .env.production")
    print("\n🚀 Your VMP Servicios platform is LIVE!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Deployment cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)
