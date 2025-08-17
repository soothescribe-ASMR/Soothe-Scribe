# scripts/auth_youtube.py
import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def main():
    flow = InstalledAppFlow.from_client_secrets_file(
        "credentials.json", SCOPES
    )
    creds = flow.run_local_server(port=0)
    print("\n🔑 Your new YT_ACCESS_TOKEN:")
    print(creds.token)
    print("\n📌 Copy the token above to GitHub → Secrets → YT_ACCESS_TOKEN")

if __name__ == "__main__":
    main()