# How to Run EduVault on Your Mobile

You have two easy ways to get the app on your phone.

## Method 1: The "Direct Run" (Easiest)
**Requirements**: Your phone is connected to PC via USB, and "USB Debugging" is on.

1. **Open Android Studio** on your PC.
2. **Open Project**: Select the `android` folder in this project:
   `D:\eduvault_-smart-e-library\android`
3. **Connect Phone**: Plug your phone into the computer.
   - *Tip*: Make sure you allowed "USB Debugging" on your phone screen if asked.
4. **Click Play**: Press the green **Run (▶)** button in the top toolbar of Android Studio.
   - It will build the app and launch it directly on your phone!

---

## Method 2: The "Send APK" Way
**Requirements**: None (Works wirelessly).

1. **Build the APK in Android Studio**:
   - Menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. **Find the File**:
   - Click "Locate" when it finishes.
   - The file is usually named `app-debug.apk`.
3. **Transfer**:
   - Send this file to yourself via WhatsApp, Telegram, Google Drive, or Email.
4. **Install**:
   - Open the file on your phone and tap **Install**.
   - *Note*: If asked, allow "Install from unknown sources".

---

## Troubleshooting
- **Build Failed?**
  - Try clicking the **Elephant Icon** (Sync Gradle) in the top right of Android Studio.
- **Old Version?**
  - If you changed code, run `npm run build` and `npx cap sync` in the terminal first (or use the helper commands I set up), THEN click Run in Android Studio.
