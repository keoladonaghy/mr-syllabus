# Google Docs API Setup Instructions

To fetch the syllabus content from Google Docs, you need to set up Google Service Account authentication.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable the Google Docs API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Docs API"
3. Click on it and press **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service account**
3. Fill in the service account details:
   - **Name**: `mr-syllabus-reader`
   - **Description**: `Service account for reading syllabus from Google Docs`
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Generate Service Account Key

1. In the **Credentials** page, find your newly created service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** > **Create new key**
5. Select **JSON** format
6. Click **Create** - this will download a JSON file

## Step 5: Share the Google Doc with the Service Account

1. Open the JSON file you just downloaded
2. Find the `client_email` field (it looks like `xyz@project-name.iam.gserviceaccount.com`)
3. Copy this email address
4. Go to your Google Doc with ID: `1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc`
5. Click **Share** button
6. Paste the service account email
7. Set permissions to **Viewer**
8. Click **Send** (uncheck "Notify people" since it's a service account)

## Step 6: Set up Environment Variable

1. Open the JSON file you downloaded
2. Copy the entire JSON content (it should start with `{"type":"service_account"...}`)
3. Open your `.env` file in the project root
4. Add this line (replace the content with your actual JSON):

```env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"xyz@project-name.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/xyz%40project-name.iam.gserviceaccount.com","universe_domain":"googleapis.com"}'
```

**Important Notes:**
- Keep the single quotes around the JSON string
- Make sure there are no line breaks in the JSON (it should be one long line)
- Keep your JSON key file secure and never commit it to version control

## Step 7: Test the Setup

Run the Q&A database generation script:

```bash
node generate-qa-database.js
```

If successful, you should see:
```
✅ Successfully fetched syllabus from Google Doc
📚 Course Info: {...}
🤖 Generating comprehensive Q&A database...
✅ Generated X Q&A pairs
✅ Q&A database generated successfully!
```

## Troubleshooting

### Error: "The caller does not have permission"
- Make sure you shared the Google Doc with the service account email
- Verify the service account has "Viewer" permissions

### Error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required"
- Check that your `.env` file contains the `GOOGLE_SERVICE_ACCOUNT_KEY` line
- Ensure the JSON is properly formatted as a single line string

### Error: "Cannot parse service account key"
- Verify the JSON format is correct
- Make sure you're using single quotes around the entire JSON string
- Check that there are no extra line breaks or characters

### Error: "Document not found"
- Verify the document ID is correct: `1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc`
- Ensure the document is shared with the service account

## Security Notes

- Never commit your service account key to version control
- The `.env` file should be in your `.gitignore`
- Rotate your service account keys periodically
- Only grant minimum necessary permissions (Viewer for read-only access)