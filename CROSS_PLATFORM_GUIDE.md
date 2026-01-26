# Cross-Platform Compatibility Guide (iOS & Android)

Your EduVault application is built with **Capacitor**, which effectively makes it a "Universal App".

## 1. Android Support (✅ Ready)
- **Status**: Fully configured.
- **Build Machine**: Can be built on **Windows**, Mac, or Linux.
- **How to Build**: Open the `android/` folder in **Android Studio** on your current computer and click "Run" or "Build APK".

## 2. iOS Support (⚠️ Review Required)
- **Status**: Codebase is ready. I have generated the `ios/` folder for you.
- **Build Machine**: **REQUIRES A MAC**.
- **Limitation**: Apple STRICTLY DOES NOT allow building iOS apps on Windows. You physically cannot generate the `.ipa` file or upload to the App Store without Xcode, which only runs on macOS.

### How to build for iOS if you are on Windows:
Since you are on Windows, you have two options:
1.  **Use a Cloud Build Service**: Tools like **Ionic Appflow** or **Expo Application Services (EAS)** can take your code and build the iOS app in the cloud for you.
2.  **Move to a Mac**: Copy this entire project folder to a Mac, run `npm install`, then open the `ios/` folder in Xcode.

## Summary
| Feature | Android | iOS |
| :--- | :--- | :--- |
| **Codebase** | Same (React) | Same (React) |
| **Configuration** | Done (`android/`) | Done (`ios/`) |
| **Can Build on Windows?** | **YES** | **NO** (Need Mac) |
