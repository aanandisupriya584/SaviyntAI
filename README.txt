Saviynt AI Onboarder - Windows Package
======================================

REQUIREMENTS
------------
Node.js 18 or higher must be installed.
Download from: https://nodejs.org/

QUICK START
-----------
1. Extract this zip to a folder (e.g. C:\SaviyntOnboarder\)
2. Double-click start.bat
3. The app will open automatically in your browser at http://localhost:3000

DEFAULT LOGIN
-------------
Username: admin
Password: admin123

DATA STORAGE
------------
All app data is stored in the data\ folder as JSON files.
Word document attachments are stored in the documents\ folder.
Back up these folders to preserve your data.

FOLDER STRUCTURE
----------------
saviynt-onboarder\
  start.bat          <- Double-click to launch
  server\
    server.cjs       <- Local server
    package.json     <- Server dependencies
  dist\              <- Built web app (do not edit)
  data\              <- Your app data (JSON files)
  documents\         <- Uploaded Word documents
  README.txt         <- This file
