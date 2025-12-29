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
