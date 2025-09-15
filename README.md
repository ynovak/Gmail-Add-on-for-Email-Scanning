# Gmail Add-on for Email Scanning

A Google Apps Script-based Gmail Add-on that provides a simple, one-click way for users to scan the currently open email for common signs of a phishing attempt.
## Features
* Simple Interface: Adds a **Scan for Phishing** button to the Gmail sidebar when an email is open.
* Confidence Score: Calculates and displays a percentage score indicating the likelihood of the email being a phishing attempt.
* Clear Findings: Lists the specific reasons for its conclusion (e.g., "Detected urgent language," "Asks for sensitive information").
* Risk Levels: Classifies emails as Low, Medium, or High risk for quick assessment.
* Lightweight: Built entirely with Google Apps Script, requiring no external servers or dependencies
## How to Deploy
To use this add-on, you need to deploy it from your own Google Apps Script account.
### Step 1: Create the Apps Script Project
1. Go to the Google Apps Script dashboard: [script.google.com](https://script.google.com).
2. Click **New project**. Give it a name, like "Phishing Scanner".
### Step 2: Add the Code
1. Delete any content in the default Code.gs file and paste the contents of the Code.gs file from this repository.
2. Enable the manifest file:
   * Click the **Project Settings** (⚙️) icon on the left.
   * Check the box for **"Show 'appsscript.json' manifest file in editor"**.
3. Add the manifest:
   * Go back to the **Editor** (<>) view.
   * Click on the appsscript.json file.
   * Paste the following JSON content into it (modify timeZone if needed):
```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.addons.execute",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/script.locale"
  ],
  "gmail": {
    "name": "Phishing Scanner",
    "logoUrl": "https://cdn-icons-png.flaticon.com/512/4289/4289829.png",
    "contextualTriggers": [
      {
        "unconditional": {},
        "onTriggerFunction": "onGmailMessageOpen"
      }
    ],
    "primaryColor": "#4285F4",
    "secondaryColor": "#4285F4",
    "openLinkUrlPrefixes": [
      "[https://mail.google.com/](https://mail.google.com/)"
    ]
  }
}
```
4. Click **Save project**.
### Step 3: Test the Add-on
1. Click the **Deploy** button and select **Test deployments**.
2. Click the **Install** button and complete the authorization flow.
3. Go to Gmail and hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R).
4. Open any email. 
5. The Phishing Scanner icon (an envelope with a shield on it <img src="https://cdn-icons-png.flaticon.com/512/4289/4289829.png" width="18">) should appear in the right-hand sidebar. 
6. Click it to use the add-on.
7. Click **Scan Email for Phishing** button to start scanning

**Disclaimer**: This is a simple proof-of-concept. The detection logic can be expanded and improved significantly for more accurate results.

