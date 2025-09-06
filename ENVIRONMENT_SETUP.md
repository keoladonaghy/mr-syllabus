# Environment Variables Setup Guide

This guide explains how to configure the environment variables needed for the hybrid Mr. Syllabus system.

## Required Environment Variables

### 1. `CLAUDE_API_KEY`
- **Purpose**: Enables Claude AI for fallback question answering
- **How to get**: Sign up at [console.anthropic.com](https://console.anthropic.com)
- **Format**: `sk-ant-api03-xxxxx...`

### 2. `GOOGLE_SERVICE_ACCOUNT_KEY` 
- **Purpose**: Allows access to your Google Doc syllabus
- **How to get**: Google Cloud Console → APIs & Services → Credentials
- **Format**: JSON string (see below)

## Setup Methods

### Method A: Vercel Environment Variables (Recommended for Production)

1. Go to your Vercel dashboard
2. Select your mr-syllabus project
3. Go to Settings → Environment Variables
4. Add both variables:
   ```
   CLAUDE_API_KEY = sk-ant-api03-xxxxx...
   GOOGLE_SERVICE_ACCOUNT_KEY = {"type":"service_account","project_id":"..."}
   ```

### Method B: Local Development (.env file)

1. Create a `.env` file in your project root:
   ```bash
   CLAUDE_API_KEY=sk-ant-api03-xxxxx...
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n","client_email":"mr-syllabus@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/mr-syllabus%40your-project.iam.gserviceaccount.com"}
   ```

## Google Service Account Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Google Docs API

### Step 2: Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name it "mr-syllabus" 
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### Step 3: Generate Key
1. Click on your new service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Download the JSON file

### Step 4: Share Your Google Doc
1. Open your syllabus Google Doc
2. Click "Share" 
3. Add the service account email (from the JSON file: `client_email`)
4. Give it "Viewer" permission
5. Click "Send"

## How the Hybrid System Works

```
Student Question
       ↓
1. Check Q&A Database (60 pre-generated pairs)
       ↓
   High Confidence (≥25%)?
       ↓                    ↓
      YES                   NO
       ↓                    ↓
Fast Response        2. Claude reads Google Doc
(No API cost)            ↓
                    AI Analysis
                         ↓
                   Detailed Response
                   (Small API cost)
```

## Cost Structure
- **~90% of questions**: FREE (database lookup)
- **~10% of questions**: Small cost (Claude API)
- **Much cheaper** than all-AI approach

## Testing Your Setup

Run the test script to verify everything works:
```bash
node test-hybrid-system.js
```

## Troubleshooting

### "Google service account key not found"
- Check that `GOOGLE_SERVICE_ACCOUNT_KEY` is set correctly
- Verify the JSON is properly formatted (no extra spaces/newlines)

### "Claude API not configured" 
- Check that `CLAUDE_API_KEY` starts with `sk-ant-api03-`
- Verify you have credits in your Anthropic account

### "Could not access Google Doc"
- Ensure the service account email has access to your Google Doc
- Check that the Document ID in the code matches your doc
- Verify Google Docs API is enabled in your Google Cloud project

## Security Notes

- Never commit `.env` files to git
- Use environment variables in production (Vercel)
- Keep your API keys secure and rotate them periodically
- The service account only needs "Viewer" access to your Google Doc