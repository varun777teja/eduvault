---
description: Build web app and sync to Android project
---

This workflow updates your Android project with the latest code changes.

1. Build the web application
// turbo
cmd /c "npm run build"

2. Sync changes to the Android native project
// turbo
cmd /c "npx cap sync android"

3. Open Android Studio (Manual Step)
   - Open the `android` folder in this project
   - Click "Run" or Go to Build > Build APK
