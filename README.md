# 💊 Medicine Reminder & Health Assistant

A comprehensive, cross-platform mobile application built with **React Native** and **Expo Router**. This application serves as a personal health assistant, helping users track their daily medications, log vital health signs, book doctor consultations, and instantly reach out to emergency contacts.

### 📥 Download the App
**[Download the latest Android APK here](https://expo.dev/accounts/lizcreates/projects/medicine-reminder-app/builds/9d648ab2-f352-4d38-aecf-02e97392a8d1)**

---

## 🌟 Key Features

### 🚀 Recent Updates
* **Custom Branding:** Added custom app icon and splash screen.
* **Robust Notifications:** Configured exact alarm permissions for Android (`SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`) to ensure precise delivery of medication reminders.
* **EAS Configuration:** Successfully set up `eas.json` for streamlined cloud APK builds.



* **Medication Scheduling & Tracking**: Easily add medicines with specific dosages and schedules. Mark them as taken and maintain an adherence streak.
* **Native Push Notifications**: Never miss a dose! The app triggers true native push notifications directly to the user's lock screen (when built as an APK or IPA).
* **Pill Refill Alerts**: The app automatically tracks remaining pills and sends a low-inventory warning notification when it's time to get a refill.
* **Health Log & Vitals**: Track blood pressure, blood sugar levels, and weight over time.
* **Health Report Generation**: Instantly generate a summary report of medication adherence and recent vitals that can be saved as a PDF or printed for medical visits.
* **Emergency SOS**: Quick-access red SOS button that dials 911 and allows saving up to 3 personal emergency contacts.
* **Doctor Consultations**: A built-in mock interface to browse available specialists and book upcoming appointments.

---

## 🛠️ Technology Stack

* **Framework**: React Native with [Expo SDK 56](https://expo.dev/)
* **Routing**: Expo Router (File-based routing)
* **Local Storage**: AsyncStorage (`@react-native-async-storage/async-storage`)
* **Animations**: React Native Animated API & SVG Progress Rings
* **Build System**: Expo Application Services (EAS)

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```
* **Web**: Press `w` to open the app in your web browser. *(Note: True background push notifications are disabled on the web version, but a foreground alert system will trigger for testing purposes).*
* **Mobile**: Download the **Expo Go** app on iOS/Android and scan the QR code to test the app on your physical device.

---

## 📦 Building for Production

To unlock the full potential of background push notifications and the native dialer, you should build the app into a native Android `.apk` file using Expo Application Services (EAS).

### Build an Android APK
1. Install the EAS Command Line tool globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log into your Expo account:
   ```bash
   eas login
   ```
3. Trigger the cloud build process:
   ```bash
   eas build -p android --profile preview
   ```
4. Once the build finishes (usually 5-10 minutes), EAS will provide a direct link and QR code to download the `.apk` file to your Android phone.

---

## 🌐 Deploying to the Web (Render, Vercel, Netlify)

If you wish to host the app as a website (Single Page Application):
1. Run the web export command:
   ```bash
   npm install && npx expo export -p web
   ```
2. Set your hosting provider to serve the generated `dist` folder.
3. **Critical**: Ensure you configure a URL Rewrite Rule on your host to redirect all routes (`/*`) to `/index.html` since Expo Router handles navigation on the client-side.
