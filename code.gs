/**
 * ARCHIVIST TOOLS - AI OCR
 * ------------------------
 * This script connects a Google Doc to Google Drive and Gemini AI.
 * It reads images from a user-specified folder, performs OCR, and
 * outputs formatted text into the current document.
 */

// --- CONFIGURATION ---
// KEEP THIS EMPTY WHEN UPLOADING TO GITHUB
// Users should paste their own key here locally.
const API_KEY = 'PASTE_YOUR_API_KEY_HERE'; 

function onOpen() {
  DocumentApp.getUi()
      .createMenu('🌟 Archivist Tools')
      .addItem('Run Image-to-Text OCR', 'promptForFolder')
      .addToUi();
}

/**
 * Step 1: Ask the user for the Google Drive Folder URL
 */
function promptForFolder() {
  const ui = DocumentApp.getUi();
  const response = ui.prompt(
    'Source Images',
    'Please paste the link (URL) to the Google Drive folder containing your JPEGs:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() == ui.Button.OK) {
    const url = response.getResponseText();
    const folderId = extractFolderId(url);
    
    if (folderId) {
      processImagesWithGemini(folderId);
    } else {
      ui.alert('Error: Could not find a valid Folder ID in that link.');
    }
  }
}

/**
 * Step 2: The Main Processing Engine
 */
function processImagesWithGemini(folderId) {
  const doc = DocumentApp.getActiveDocument(); // Uses the currently open doc!
  const body = doc.getBody();
  
  // 1. Validate Folder
  let sourceFolder;
  try {
    sourceFolder = DriveApp.getFolderById(folderId);
  } catch (e) {
    DocumentApp.getUi().alert("Error: Access denied or folder not found. Check permissions.");
    return;
  }

  const files = sourceFolder.getFilesByType(MimeType.JPEG);

  // 2. Auto-Detect Model
  const modelName = getBestAvailableModel(API_KEY);
  if (!modelName) {
    body.appendParagraph("Error: Could not connect to Gemini API. Check your API Key.");
    return;
  }

  // 3. Loop through files
  if (!files.hasNext()) {
    DocumentApp.getUi().alert("No JPEG files found in that folder!");
    return;
  }

  // Notify user it's starting
  doc.saveAndClose(); // Save current state before heavy lifting
  
  // We need to re-open purely for the loop logic to work safely with UI updates
  // Note: We can't use 'ui.alert' inside the loop easily without pausing script
  
  runBatchProcessing(folderId, modelName);
}
function runBatchProcessing(folderId, modelName) {
  const sourceFolder = DriveApp.getFolderById(folderId);
  const filesIterator = sourceFolder.getFilesByType(MimeType.JPEG);
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();

  // 1. COLLECT AND SORT FILES
  var fileArray = [];
  while (filesIterator.hasNext()) {
    fileArray.push(filesIterator.next());
  }

  // Sort A-Z
  fileArray.sort(function(a, b) {
    var nameA = a.getName().toLowerCase();
    var nameB = b.getName().toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  if (fileArray.length === 0) {
     DocumentApp.getUi().alert("No JPEG files found in that folder!");
     return;
  }

  // 2. CHECK EXISTING PROGRESS
  // We grab all the text currently in the doc so we know what to skip.
  const existingText = body.getText();

  // 3. PROCESS LOOP
  for (var i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const fileName = file.getName();

    // --- THE SKIP LOGIC ---
    // If the filename is already in the doc, skip it!
    if (existingText.includes("FILE: " + fileName)) {
      console.log(`Skipping ${fileName} (Already processed)`);
      continue; // Jumps to the next iteration of the loop
    }

    // If we are here, the file is new. Let's process it.
    console.log(`Processing: ${fileName}`);
    
    try {
      const imageBlob = file.getBlob();
      const base64Image = Utilities.base64Encode(imageBlob.getBytes());

      const payload = {
        "contents": [{
          "parts": [
            { "text": "Transcribe the text in this image perfectly. If the image contains a list or columnar data, format it as a clean Markdown table. If it is an article, preserve the headings. Do not include your own commentary." },
            { "inline_data": { "mime_type": "image/jpeg", "data": base64Image }}
          ]
        }]
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`;
      const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload),
        'muteHttpExceptions': true
      };

      const response = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(response.getContentText());

      if (json.candidates && json.candidates[0].content) {
        const aiText = json.candidates[0].content.parts[0].text;
        
        // Output Style
        var headerPara = body.appendParagraph("FILE: " + fileName);
        headerPara.setBold(true).setFontSize(14);
        
        body.appendParagraph(aiText);
        body.appendHorizontalRule();
        body.appendPageBreak();
        
        // Save progress to drive so we don't lose it if we crash
        doc.saveAndClose();
        doc = DocumentApp.getActiveDocument();
        body = doc.getBody();
        
      } else {
        console.log(`Error on ${fileName}: ${JSON.stringify(json)}`);
      }

    } catch (e) {
      console.log(`Failed ${fileName}: ${e.message}`);
    }

    // 4. SPEED ADJUSTMENT
    // I reduced this to 1000 (1 second). 
    // This makes it faster, but still polite to the API.
    Utilities.sleep(1000); 
  }
  
  DocumentApp.getUi().alert('✅ OCR Complete!');
}

// UTILITIES
function extractFolderId(url) {
  // Handles standard drive URLs
  const match = url.match(/[-\w]{25,}/); 
  return match ? match[0] : null;
}

function getBestAvailableModel(apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = UrlFetchApp.fetch(url);
    const json = JSON.parse(response.getContentText());
    if (!json.models) return null;
    const flashModels = json.models.filter(m => 
      m.name.toLowerCase().includes("flash") && 
      m.supportedGenerationMethods.includes("generateContent")
    );
    return flashModels.length > 0 ? flashModels[0].name : json.models[0].name;
  } catch (e) {
    return "models/gemini-2.5-flash"; 
  }
}
