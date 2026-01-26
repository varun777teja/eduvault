# How to Create the APK for EduVault

Since your system environment is not fully configured for command-line builds (missing JAVA_HOME), you must use **Android Studio** to generate the APK. This is the standard and most reliable way.

### Step 1: Open the Project
1. Open **Android Studio**.
2. Click **Open** (or File > Open).
3. Navigate to and select this folder:
   `D:\eduvault_-smart-e-library\android`
   *(Important: Select the `android` folder, not the main project folder)*

### Step 2: Build the APK
1. Wait for the project to sync. You will see progress bars at the bottom right.
2. Once synced, go to the top menu bar.
3. Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.

### Step 3: Locate the File
1. The build process will take a few minutes.
2. When finished, a small pop-up notification will appear at the bottom right saying "APK(s) generated successfully".
3. Click the **locate** link in that notification.
4. It will open the folder containing your `app-debug.apk`. You can now transfer this file to your phone to install.

### Troubleshooting
- If you see an error about **Gradle**, click "Upgrade Gradle" or "Sync Project with Gradle Files" (the elephant icon in the top right).
- If asked to update **Android SDK**, accept the license and install.
