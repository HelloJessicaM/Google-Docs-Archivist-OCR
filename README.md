# Google Docs Archivist OCR 📚

A simple Google Apps Script that connects Google Drive + Google Docs + Gemini AI to digitize vintage magazines, lists, and articles.

## Features
* **AI-Powered:** Uses Gemini 1.5 Flash (or newer) for high-accuracy OCR.
* **Format Aware:** Detects tables/columns automatically and formats them as pipes (`|`) for easy spreadsheet conversion.
* **Batch Processing:** Processes entire folders of JPEGs at once.
* **User Friendly:** Adds a custom menu to Google Docs.

## Setup
1.  Open a new **Google Doc**.
2.  Go to **Extensions > Apps Script**.
3.  Copy the code from `Code.gs` in this repository and paste it into the editor.
4.  **Get an API Key:** Go to [Google AI Studio](https://aistudio.google.com/), create a free API key.
5.  Paste your key into the code where it says `PASTE_YOUR_API_KEY_HERE`.
6.  **Enable Drive API:** In the Apps Script editor, click "Services" (+) on the left, search for "Drive API", and add it.
7.  Save and Refresh your Google Doc.

## Usage
1.  You will see a new menu: **🌟 Archivist Tools**.
2.  Click **Run Image-to-Text OCR**.
3.  Paste the link to your Google Drive folder containing images.
4.  Watch the text appear!

## Best Practices & Troubleshooting

### 1. Naming Your Files
The script processes images in **alphabetical order (A-Z)** based on the filename. To ensure your pages appear in the correct order in the Google Doc, use sequential numbering with leading zeros:
* ✅ `Scan_001.jpg`, `Scan_002.jpg`, `Scan_010.jpg`
* ❌ `Page1.jpg`, `Page10.jpg`, `Page2.jpg` (Computer sorting will often put Page 10 before Page 2)

### 2. Handling Timeouts ("Exceeds maximum execution time")
Google Apps Script has a strict time limit (6 minutes for free accounts). If you are processing a large folder, the script **will** stop before finishing. This is normal.

**How to fix it:**
1.  Simply click **Run** again.
2.  The script has **"Smart Resume"** logic: it looks at your Google Doc, sees which files are already finished, and automatically skips them.
3.  Repeat this process until you see the `✅ OCR Complete!` message.
